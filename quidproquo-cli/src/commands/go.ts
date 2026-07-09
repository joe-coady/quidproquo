// `qpq go` — interactive deploy. Resolves the app + environment (which names
// the deploy platform in apps/<app>/deploy.config.json, default aws), asks the
// deploy plan, then hands off to the platform driver.
import { resolveDeployEnvironment } from '../lib/deployEnv';
import { promptDeployPlan } from '../lib/deployPrompts';
import { resolveAppSelection } from '../lib/resolveAppSelection';
import { getPlatformDriver } from '../platforms';

export const goCommand = async (argv: string[]): Promise<void> => {
  const appName = await resolveAppSelection({ argv, envVar: 'DEPLOY_APP_NAME' });
  const { platform } = await resolveDeployEnvironment(argv, appName);
  const driver = getPlatformDriver(platform);

  const plan = await promptDeployPlan(appName);

  await driver.go(appName, plan);
};
