// `qpq go:docker` — asks the same questions as `qpq go`, then deploys in
// parallel via docker instead of sequentially:
//
//   1. Build everything locally first: QPQ config synth, rspack API bundles,
//      rspack view bundles, and one self-contained CDK cloud assembly per
//      service (`cdk synth --output dist/qpq/cdk-docker/<app>/<service>`).
//   2. Wave 1 (inf): one docker container per service deploys its inf stack,
//      all concurrently. Containers run only the CDK CLI against the mounted
//      pre-synthesized assembly — the workspace (and its npm-linked
//      quidproquo packages) never needs to exist inside the image.
//   3. Wave 2 (api + web): once every inf stack is done, api and web stacks
//      for all services deploy concurrently (they depend only on inf, not on
//      each other).
//   4. Views: the already-built bundles are synced to S3, one aws-cli
//      container per service, all concurrently.
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
import { loadServiceQpqConfig } from '../../lib/qpqConfigs';
import { runRspack } from '../../lib/rspackRun';
import { nextPrefixColor, runCommand, runCommandPrefixed } from '../../lib/runCommand';
import { assertNoFailures, runTasks } from '../../lib/runTasks';
import { logTimeEnd, logTimeStart } from '../../lib/timing';
import { bundleViews, getViewsDistDir } from '../../lib/views';
import { isAwsCredentialsValid } from './awsCredentials';
import { getCdkAppCommand, getDockerDir } from './cdkApp';
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

const assertDockerRunning = async (): Promise<void> => {
  try {
    await runCommand('docker', ['info', '--format', '"docker daemon ok — server {{.ServerVersion}}"']);
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
const dockerDeployStack = (
  color: number,
  appName: string,
  serviceName: string,
  stackType: 'inf' | 'api' | 'web',
  stackName: string,
): Promise<void> => {
  const containerName = `${serviceName}-${stackType}`;
  return runCommandPrefixed(
    `${stackType}:${serviceName}`,
    'docker',
    [
      // A container left behind by an interrupted run would block reusing the
      // name — clear it quietly first.
      'rm',
      '-f',
      containerName,
      '>/dev/null',
      '2>&1',
      ';',
      'docker',
      'run',
      '--rm',
      '--name',
      containerName,
      '-v',
      `"${assemblyDir(appName, serviceName)}:/assembly:ro"`,
      ...AWS_ENV_PASSTHROUGH.flatMap((name) => ['-e', name]),
      IMAGE_TAG,
      'bash',
      '-c',
      `"cp -r /assembly /work/assembly && cdk deploy ${stackName} --app /work/assembly --require-approval never --progress events"`,
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
    await runCommandPrefixed(
      `views:${serviceName}`,
      'docker',
      [
        'rm',
        '-f',
        containerName,
        '>/dev/null',
        '2>&1',
        ';',
        'docker',
        'run',
        '--rm',
        '--name',
        containerName,
        '-v',
        `"${getViewsDistDir(appName, serviceName)}:/views:ro"`,
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

  if (needCdkDeploys || viewServices.length > 0) {
    await assertDockerRunning();
  }
  if (needCdkDeploys) {
    await buildDeployerImage();
  }
  if (viewServices.length > 0) {
    // Pull up front so the views wave doesn't race N containers into pulling
    // the same image.
    await runCommand('docker', ['pull', AWS_CLI_IMAGE]);
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
            await runCommandPrefixed(
              `cdk-synth:${service}`,
              'npx',
              ['cdk', 'synth', '--quiet', '--app', `'${getCdkAppCommand()}'`, '--output', `"${outputDir}"`],
              {
                cwd: getRoot(),
                env: { DEPLOY_SERVICE_NAME: service, DEPLOY_APP_NAME: appName },
                color: nextPrefixColor(),
              },
            );
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

  logTimeEnd('totalTime');
};
