import fs from 'fs';
import path from 'path';

import { getAppDirectory, getAvailableApps } from './discovery';
import { runCommand } from './runCommand';

// App lifecycle hooks: apps/<app>/package.json scripts named `qpq:<hook>`
// (e.g. qpq:postinstall, qpq:prebuild). The CLI invokes them when present;
// apps without the hook are skipped silently.
export const runAppHook = async (appName: string, hook: string): Promise<boolean> => {
  const packageJsonPath = path.join(getAppDirectory(appName), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const scriptName = `qpq:${hook}`;
  if (!packageJson.scripts?.[scriptName]) {
    return false;
  }

  console.log(`Running ${scriptName} for [${appName}]`);
  await runCommand('npm', ['run', scriptName], { cwd: getAppDirectory(appName) });
  return true;
};

export const runAppHookForAllApps = async (hook: string): Promise<void> => {
  for (const appName of getAvailableApps()) {
    await runAppHook(appName, hook);
  }
};
