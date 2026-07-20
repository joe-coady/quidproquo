// `qpq go:docker` — asks the same questions as `qpq go`, then deploys in
// parallel via docker instead of sequentially:
//
//   1. Build everything locally first: QPQ config synth, rspack API bundles,
//      rspack view bundles, rspack federated-remote bundles, and one
//      self-contained CDK cloud assembly per service
//      (`cdk synth --output dist/qpq/cdk-docker/<app>/<service>`).
//   2. Wave 1 (inf): one docker container per service deploys its inf stack,
//      all concurrently. Containers run only the CDK CLI against the mounted
//      pre-synthesized assembly — the workspace (and its npm-linked
//      quidproquo packages) never needs to exist inside the image.
//   3. Wave 2 (api + web): once every inf stack is done, api and web stacks
//      for all services deploy concurrently (they depend only on inf, not on
//      each other).
//   4. Views: the already-built bundles are synced to S3, one aws-cli
//      container per service, all concurrently.
//   5. Publish: the already-built federated remotes (backends that opt in with
//      defineFederatedModuleStore(...)) are synced to S3 and their manifests
//      flipped, one aws-cli container per service, all concurrently.
//
// domain/bootstrap menu options deploy host-side exactly like `qpq go` —
// a single stack gains nothing from docker.
//
// Requires the same env as `go` plus a running docker daemon. Knobs:
// GO_DOCKER_BUILD_CONCURRENCY (default 4 — local builds are CPU-bound) and
// GO_DOCKER_DEPLOY_CONCURRENCY (default unlimited — deploys just wait on
// CloudFormation).
import { qpqDeployAwsCdkUtils } from 'quidproquo-deploy-awscdk';
import { getServiceRspackConfig } from 'quidproquo-deploy-rspack';

import fs from 'fs';
import path from 'path';

import { synthCommand } from '../../commands/synth';
import { DeployPlan } from '../../lib/deployPrompts';
import { getRoot, getServiceDirectory, getServiceNamesWithViews } from '../../lib/discovery';
import { runAppHook } from '../../lib/hooks';
import { getServiceNamesWithFederation, loadServiceQpqConfig } from '../../lib/qpqConfigs';
import { runRspack } from '../../lib/rspackRun';
import { nextPrefixColor, runCommand, runCommandBestEffort, runCommandPrefixed } from '../../lib/runCommand';
import { assertNoFailures, runTasks } from '../../lib/runTasks';
import { logTimeEnd, logTimeStart } from '../../lib/timing';
import { bundleViews, getViewsDistDir } from '../../lib/views';
import { isAwsCredentialsValid } from './awsCredentials';
import { getCdkAppCommand, getDockerDir } from './cdkApp';
import { buildRemote, resolvePublishTarget } from './remote';
import { deployAccountStack, deployBootstrapStack, deployDomainStack } from './stacks';
import { getViewsS3Destinations } from './viewsSync';

const IMAGE_TAG = 'qpq-cdk-deployer';
const AWS_CLI_IMAGE = 'amazon/aws-cli';

const BUILD_CONCURRENCY = Number(process.env.GO_DOCKER_BUILD_CONCURRENCY) || 4;
const DEPLOY_CONCURRENCY = Number(process.env.GO_DOCKER_DEPLOY_CONCURRENCY) || Infinity;

// Credentials/region reach the containers via `docker run -e NAME` (value
// inherited from this process's env, never on the docker command line).
const AWS_ENV_PASSTHROUGH = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
  'AWS_REGION',
  'AWS_DEFAULT_REGION',
  'AWS_DEFAULT_ACCOUNT',
];

const assemblyDir = (appName: string, serviceName: string): string => path.join(getRoot(), 'dist', 'qpq', 'cdk-docker', appName, serviceName);

// A container left behind by an interrupted run would block reusing its name.
// Clear it first, best-effort: a missing container (exit 1) must not fail the
// deploy. Was a `docker rm -f … >/dev/null 2>&1 ;` prefix on the run command,
// but that only worked under `shell: true`; as a separate call it's shell-free.
const removeContainer = (containerName: string): Promise<void> => runCommandBestEffort('docker', ['rm', '-f', containerName]);

const assertDockerRunning = async (): Promise<void> => {
  try {
    await runCommand('docker', ['info', '--format', 'docker daemon ok — server {{.ServerVersion}}']);
  } catch {
    throw new Error('Docker daemon is not running (start Docker Desktop and retry).');
  }
};

const buildDeployerImage = async (): Promise<void> => {
  // Pin the image's CDK CLI to the CLI's own aws-cdk version so it can always
  // read the assembly schema the host synthesized.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cdkVersion = require('aws-cdk/package.json').version as string;
  console.log(`Building deployer image [${IMAGE_TAG}] (aws-cdk ${cdkVersion})`);
  await runCommand('docker', ['build', '-t', IMAGE_TAG, '--build-arg', `CDK_VERSION=${cdkVersion}`, getDockerDir()]);
};

// Deploy one stack from a pre-synthesized assembly in a throwaway container
// named <service>-<stackType> (e.g. mini-web) so `docker ps` reads cleanly.
// The assembly mounts read-only and is copied container-local first — the CDK
// CLI writes lock files next to the assembly it reads, and the copy keeps
// parallel api/web deploys of the same service fully isolated.
const dockerDeployStack = async (
  color: number,
  appName: string,
  serviceName: string,
  stackType: 'inf' | 'api' | 'web',
  stackName: string,
): Promise<void> => {
  const containerName = `${serviceName}-${stackType}`;
  await removeContainer(containerName);
  await runCommandPrefixed(
    `${stackType}:${serviceName}`,
    'docker',
    [
      'run',
      '--rm',
      '--name',
      containerName,
      '-v',
      `${assemblyDir(appName, serviceName)}:/assembly:ro`,
      ...AWS_ENV_PASSTHROUGH.flatMap((name) => ['-e', name]),
      IMAGE_TAG,
      'bash',
      '-c',
      `cp -r /assembly /work/assembly && cdk deploy ${stackName} --app /work/assembly --require-approval never --progress events`,
    ],
    { color },
  );
};

// Sync one service's pre-built views to S3 in a throwaway aws-cli container
// named <service>-views. The official image's entrypoint is `aws`. Multiple
// destinations (shell → website root + views prefix) run sequentially within
// the service, reusing the container name.
const dockerSyncViews = async (color: number, appName: string, serviceName: string): Promise<void> => {
  const containerName = `${serviceName}-views`;
  for (const destination of getViewsS3Destinations(appName, serviceName)) {
    await removeContainer(containerName);
    await runCommandPrefixed(
      `views:${serviceName}`,
      'docker',
      [
        'run',
        '--rm',
        '--name',
        containerName,
        '-v',
        `${getViewsDistDir(appName, serviceName)}:/views:ro`,
        ...AWS_ENV_PASSTHROUGH.flatMap((name) => ['-e', name]),
        AWS_CLI_IMAGE,
        's3',
        'sync',
        '/views',
        destination,
      ],
      { color },
    );
  }
};

// Publish one service's already-built federated remote to S3 in a throwaway
// aws-cli container named <service>-publish. The version dir (everything the
// manifest references) syncs first, then the manifest.json is copied last —
// same ordering guarantee as the host-side publish, so a reading lambda never
// sees a manifest whose files aren't all present yet. resolvePublishTarget reads
// the manifest hash + resolved bucket/prefix from the buildRemote output.
const dockerPublishRemote = async (color: number, appName: string, serviceName: string): Promise<void> => {
  const { publishPath, manifestHash, bucketName, servicePrefix } = resolvePublishTarget(appName, serviceName);
  const containerName = `${serviceName}-publish`;

  // /publish is the service-remote-published dir; the hashed version subdir and
  // manifest.json both live directly under it.
  const s3Operations: string[][] = [
    ['s3', 'sync', `/publish/${manifestHash}`, `s3://${bucketName}/${servicePrefix}/${manifestHash}`],
    ['s3', 'cp', '/publish/manifest.json', `s3://${bucketName}/${servicePrefix}/manifest.json`],
  ];

  for (const s3Operation of s3Operations) {
    await removeContainer(containerName);
    await runCommandPrefixed(
      `publish:${serviceName}`,
      'docker',
      [
        'run',
        '--rm',
        '--name',
        containerName,
        '-v',
        `${publishPath}:/publish:ro`,
        ...AWS_ENV_PASSTHROUGH.flatMap((name) => ['-e', name]),
        AWS_CLI_IMAGE,
        ...s3Operation,
      ],
      { color },
    );
  }
};

export const awsGoDocker = async (appName: string, plan: DeployPlan): Promise<void> => {
  if (plan.kind === 'cancelled') {
    return;
  }

  if ((await isAwsCredentialsValid()) === false) {
    console.log('Credentials are expired or invalid.');
    return;
  }

  logTimeStart('totalTime');

  if (plan.kind === 'account') {
    await deployAccountStack(plan.appName);
    logTimeEnd('totalTime');
    return;
  }

  if (plan.kind === 'bootstrap') {
    if (plan.includeDomain) {
      await deployDomainStack(plan.appName);
    }
    await deployBootstrapStack(plan.appName);
    logTimeEnd('totalTime');
    return;
  }

  const { services, stacks } = plan;

  const allStacks = stacks === 'all';
  const needInf = allStacks || stacks === 'inf';
  const needApi = allStacks || stacks === 'api';
  const needWeb = allStacks || stacks === 'web';
  const needViews = allStacks || stacks === 'views';
  const needCdkDeploys = needInf || needApi || needWeb;

  const viewServices = needViews ? services.filter((s) => getServiceNamesWithViews(appName).includes(s)) : [];

  console.log('\n\nRunning dockerized deploy\n\n');
  console.log('Executing for services');
  console.log(services.join(', '));

  // Federated publish needs the api stack (needApi ⇒ needCdkDeploys), so any
  // docker preflight it requires is already covered by these two checks.
  if (needCdkDeploys || viewServices.length > 0) {
    await assertDockerRunning();
  }
  if (needCdkDeploys) {
    await buildDeployerImage();
  }

  // ---- Phase 1: build everything locally ----
  console.log('\n=== Phase 1: local builds ===\n');

  await runAppHook(appName, 'predeploy');

  // Workspace packages resolve through their built dist/ (package.json main),
  // so bundles would ship stale code unless every lib is tsc'd first. npm runs
  // the workspaces in topological order; tsc -b is incremental, so this is
  // seconds when nothing changed.
  console.log('Building workspace packages');
  await runCommand('npm', ['run', 'build', '--workspaces', '--if-present']);

  // Synth QPQ configs (shell's config resolves the view bucket names).
  // In-process (no subprocess per service) — it's just config loads + JSON writes.
  const qpqSynthServices = [...new Set([...services, ...(needViews ? ['shell'] : [])])];
  for (const service of qpqSynthServices) {
    await synthCommand([service, '--app', appName]);
  }

  // Federated remotes are the backend story code, so republish them whenever the
  // api stack was (re)deployed. Skips services without defineFederatedModuleStore(...).
  // Detected here (after the workspace build) because it loads each service's config.
  const federatedServices = needApi ? getServiceNamesWithFederation(appName, services) : [];

  // The aws-cli image backs both the views sync (phase 4) and the federated
  // publish (phase 5) waves. Pull once now so those waves don't race N containers
  // into pulling the same image. Docker is already confirmed running above.
  if (viewServices.length > 0 || federatedServices.length > 0) {
    await runCommand('docker', ['pull', AWS_CLI_IMAGE]);
  }

  if (stacks !== 'views') {
    assertNoFailures(
      'API bundling',
      await runTasks(
        services.map((service) => ({
          label: `bundle-api:${service}`,
          run: async () => {
            console.log(`Bundling api: [${service}]`);
            const qpqConfig = loadServiceQpqConfig(appName, service);
            await runRspack(getServiceRspackConfig(qpqConfig, path.join(getServiceDirectory(appName, service), 'service')));
          },
        })),
        BUILD_CONCURRENCY,
      ),
    );
  }

  assertNoFailures(
    'Views bundling',
    await runTasks(
      viewServices.map((service) => ({
        label: `bundle-views:${service}`,
        run: async () => {
          console.log(`Bundling views: [${service}]`);
          await bundleViews(appName, service);
        },
      })),
      BUILD_CONCURRENCY,
    ),
  );

  // Build the federated remotes locally now (rspack needs the workspace), so the
  // publish wave only has to sync the already-built output — mirroring how views
  // are bundled here and synced later.
  assertNoFailures(
    'Remote bundling',
    await runTasks(
      federatedServices.map((service) => ({
        label: `bundle-remote:${service}`,
        run: async () => {
          console.log(`Bundling federated remote: [${service}]`);
          await buildRemote(appName, service);
        },
      })),
      BUILD_CONCURRENCY,
    ),
  );

  if (needCdkDeploys) {
    // One self-contained cloud assembly per service (all its stacks + staged
    // assets) — separate --output dirs so synths can run in parallel and
    // containers never share mutable state.
    assertNoFailures(
      'CDK synth',
      await runTasks(
        services.map((service) => ({
          label: `cdk-synth:${service}`,
          run: async () => {
            const outputDir = assemblyDir(appName, service);
            fs.rmSync(outputDir, { recursive: true, force: true });
            await runCommandPrefixed(`cdk-synth:${service}`, 'npx', ['cdk', 'synth', '--quiet', '--app', getCdkAppCommand(), '--output', outputDir], {
              cwd: getRoot(),
              env: { DEPLOY_SERVICE_NAME: service, DEPLOY_APP_NAME: appName },
              color: nextPrefixColor(),
            });
          },
        })),
        BUILD_CONCURRENCY,
      ),
    );
  }

  // Stack names come from each service's live config, resolved once up front.
  const stackNames = new Map(
    services.map((service) => {
      const qpqConfig = loadServiceQpqConfig(appName, service);
      return [
        service,
        {
          inf: qpqDeployAwsCdkUtils.getInfStackName(qpqConfig),
          api: qpqDeployAwsCdkUtils.getApiStackName(qpqConfig),
          web: qpqDeployAwsCdkUtils.getWebStackName(qpqConfig),
        },
      ];
    }),
  );

  // ---- Phase 2: inf stacks, one container per service, all concurrent ----
  if (needInf) {
    console.log('\n=== Phase 2: deploy inf stacks (docker) ===\n');
    logTimeStart('infWave');
    assertNoFailures(
      'Inf deploy',
      await runTasks(
        services.map((service) => ({
          label: `inf:${service}`,
          run: () => dockerDeployStack(nextPrefixColor(), appName, service, 'inf', stackNames.get(service)!.inf),
        })),
        DEPLOY_CONCURRENCY,
      ),
    );
    logTimeEnd('infWave');
  }

  // ---- Phase 3: api + web stacks, all concurrent ----
  if (needApi || needWeb) {
    console.log('\n=== Phase 3: deploy api + web stacks (docker) ===\n');
    logTimeStart('apiWebWave');
    assertNoFailures(
      'Api/Web deploy',
      await runTasks(
        (['api', 'web'] as const)
          .filter((stackType) => (stackType === 'api' ? needApi : needWeb))
          .flatMap((stackType) =>
            services.map((service) => ({
              label: `${stackType}:${service}`,
              run: () => dockerDeployStack(nextPrefixColor(), appName, service, stackType, stackNames.get(service)![stackType]),
            })),
          ),
        DEPLOY_CONCURRENCY,
      ),
    );
    logTimeEnd('apiWebWave');
  }

  // ---- Phase 4: sync the pre-built views to S3, all concurrent ----
  if (viewServices.length > 0) {
    console.log('\n=== Phase 4: sync views to S3 (docker) ===\n');
    logTimeStart('viewsWave');
    assertNoFailures(
      'Views sync',
      await runTasks(
        viewServices.map((service) => ({
          label: `views:${service}`,
          run: () => dockerSyncViews(nextPrefixColor(), appName, service),
        })),
        DEPLOY_CONCURRENCY,
      ),
    );
    logTimeEnd('viewsWave');
  }

  // ---- Phase 5: publish the pre-built federated remotes to S3, all concurrent ----
  if (federatedServices.length > 0) {
    console.log('\n=== Phase 5: publish federated remotes to S3 (docker) ===\n');
    logTimeStart('publishWave');
    assertNoFailures(
      'Federated publish',
      await runTasks(
        federatedServices.map((service) => ({
          label: `publish:${service}`,
          run: () => dockerPublishRemote(nextPrefixColor(), appName, service),
        })),
        DEPLOY_CONCURRENCY,
      ),
    );
    logTimeEnd('publishWave');
  }

  logTimeEnd('totalTime');
};
