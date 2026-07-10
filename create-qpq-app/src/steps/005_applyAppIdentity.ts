import fs from 'fs';
import path from 'path';

import { readJsonFile, replaceInFileExact, replaceInFiles, writeJsonFile } from '../lib/files';
import { CreateQpqAppStep } from '../types';

// Give the app its identity. Only targeted, collision-free tokens are
// rewritten — the app FOLDER, the package SCOPE and the deploy PREFIX take
// the app name, while template vocabulary (TodoServiceEnum, services/todo,
// TodoList, TODO comments) is deliberately left alone so every generated app
// shares the same internal layout.
export const applyAppIdentity: CreateQpqAppStep = {
  name: 'Applying app identity',

  run: async ({ targetDirectory, answers }) => {
    const { appName } = answers;

    const todoAppDirectory = path.join(targetDirectory, 'apps', 'todo');
    const appDirectory = path.join(targetDirectory, 'apps', appName);
    if (appName !== 'todo') {
      fs.renameSync(todoAppDirectory, appDirectory);
    }

    replaceInFiles(targetDirectory, [
      // Workspace package scope: @todo/constants -> @myapp/constants
      ['@todo/', `@${appName}/`],
      // Build/dist and federated-alias paths: dist/apps/todo/... -> dist/apps/myapp/...
      ['apps/todo/', `apps/${appName}/`],
    ]);

    // The deploy prefix names every stack/resource — this is the app name.
    const deployConfigPath = path.join(targetDirectory, 'apps', appName, 'deploy.config.json');
    const deployConfig = readJsonFile(deployConfigPath);
    deployConfig.prefix = appName;
    writeJsonFile(deployConfigPath, deployConfig);

    replaceInFileExact(
      path.join(appDirectory, 'packages', 'service-utils', 'src', 'defineTodoService.ts'),
      "const modulePrefix = 'todo';",
      `const modulePrefix = '${appName}';`,
    );

    const rootPackageJsonPath = path.join(targetDirectory, 'package.json');
    const rootPackageJson = readJsonFile(rootPackageJsonPath);
    rootPackageJson.name = appName;
    writeJsonFile(rootPackageJsonPath, rootPackageJson);
  },
};
