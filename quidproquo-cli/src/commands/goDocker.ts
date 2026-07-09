// `qpq go:docker` — asks the same questions as `qpq go`, then runs the
// platform driver's parallel containerized deploy (drivers without a docker
// strategy don't offer one).
import { resolveDeployEnvironment } from '../lib/deployEnv';
import { promptDeployPlan } from '../lib/deployPrompts';
import { resolveAppSelection } from '../lib/resolveAppSelection';
import { getPlatformDriver } from '../platforms';

export const goDockerCommand = async (argv: string[]): Promise<void> => {
  const appName = await resolveAppSelection({ argv, envVar: 'DEPLOY_APP_NAME' });
  const { platform } = await resolveDeployEnvironment(argv, appName);
  const driver = getPlatformDriver(platform);

  if (!driver.goDocker) {
    console.error(`Platform '${platform}' has no dockerized deploy — use qpq go instead.`);
    process.exit(1);
  }

  const plan = await promptDeployPlan(appName);

  await driver.goDocker(appName, plan);
};
