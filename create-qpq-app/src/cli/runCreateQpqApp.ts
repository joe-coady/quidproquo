import path from 'path';

import { getArgValue, getPositionalArgs } from '../lib/args';
import { getOwnPackageRoot, getOwnVersion } from '../lib/packageRoot';
import { promptSelect } from '../lib/prompts';
import { createQpqAppSteps } from '../steps';
import { AppLanguage, CreateQpqAppAnswers, StepContext } from '../types';

const USAGE = `Usage: npx create-qpq-app <app-name> [options]

Options:
  --language <typescript|javascript>   skip the language prompt
  --domain <domain>                    app domain (default: <app-name>.example.com)
  --no-git                             skip git init
  --no-install                         skip npm install
`;

// Resolve the language from a flag when given, otherwise prompt — flags keep
// CI and tests non-interactive.
const resolveLanguage = async (argv: string[]): Promise<AppLanguage> => {
  const flagValue = getArgValue(argv, '--language')?.toLowerCase();
  if (flagValue) {
    if (!(flagValue in AppLanguage)) {
      throw new Error(`Unknown --language "${flagValue}" — use typescript or javascript.`);
    }
    return AppLanguage[flagValue as keyof typeof AppLanguage];
  }

  const selected = await promptSelect('Which language would you like?', ['TypeScript', 'JavaScript'], 'TypeScript');
  return selected === 'JavaScript' ? AppLanguage.javascript : AppLanguage.typescript;
};

export const runCreateQpqApp = async (argv: string[]): Promise<void> => {
  const [appName] = getPositionalArgs(argv, ['--language', '--domain']);

  if (!appName || argv.includes('--help')) {
    console.log(USAGE);
    process.exit(appName ? 0 : 1);
  }

  // All answers are locked in before the first step runs — no mid-pipeline
  // prompting, so every step sees the same complete answers object.
  const answers: CreateQpqAppAnswers = {
    appName,
    language: await resolveLanguage(argv),
    domain: getArgValue(argv, '--domain') ?? `${appName}.example.com`,
    initialiseGit: !argv.includes('--no-git'),
    installDependencies: !argv.includes('--no-install'),
  };

  const context: StepContext = {
    targetDirectory: path.resolve(process.cwd(), appName),
    templateDirectory: path.join(getOwnPackageRoot(), 'template'),
    ownVersion: getOwnVersion(),
    answers,
  };

  for (const step of createQpqAppSteps) {
    if (step.shouldRun && !step.shouldRun(answers)) {
      continue;
    }

    console.log(`\n▸ ${step.name}`);
    await step.run(context);
  }
};
