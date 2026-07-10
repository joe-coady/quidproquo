import path from 'path';

import { readJsonFile, replaceInFileExact, writeJsonFile } from '../lib/files';
import { CreateQpqAppStep } from '../types';

// The template's domain, replaced wherever it's authoritative: the deploy
// config and the app's domain constant (everything else derives from those).
const TEMPLATE_DOMAIN = 'todo.quidproquojs.com';

export const applyDomain: CreateQpqAppStep = {
  name: 'Applying domain',

  run: async ({ targetDirectory, answers }) => {
    const deployConfigPath = path.join(targetDirectory, 'apps', answers.appName, 'deploy.config.json');
    const deployConfig = readJsonFile(deployConfigPath);
    deployConfig.domain = answers.domain;
    writeJsonFile(deployConfigPath, deployConfig);

    replaceInFileExact(
      path.join(targetDirectory, 'apps', answers.appName, 'packages', 'constants', 'src', 'domain.ts'),
      TEMPLATE_DOMAIN,
      answers.domain,
    );
  },
};
