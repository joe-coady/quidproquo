// `qpq clear-resources` — interactively EMPTY selected data resources (storage
// drive buckets, key value store tables) without touching the stacks: the
// "reset my data" counterpart to `qpq teardown`. Resolves the app +
// environment the same way as go/teardown, enumerates the app's owned
// resources from its live qpq configs, multi-selects what to empty (with a
// typed confirmation — this deletes stored data), then hands off to the
// platform driver.
import { promptClearResourcesPlan } from '../lib/clearResourcesPlan';
import { resolveDeployEnvironment } from '../lib/deployEnv';
import { resolveAppSelection } from '../lib/resolveAppSelection';
import { getPlatformDriver } from '../platforms';

export const clearResourcesCommand = async (argv: string[]): Promise<void> => {
  const appName = await resolveAppSelection({ argv, envVar: 'DEPLOY_APP_NAME' });
  const { platform } = await resolveDeployEnvironment(argv, appName);
  const driver = getPlatformDriver(platform);

  if (!driver.clearResources) {
    console.error(`The '${platform}' platform has no clear-resources strategy.`);
    process.exit(1);
  }

  const plan = await promptClearResourcesPlan(appName);

  await driver.clearResources(appName, plan);
};
