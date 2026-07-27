import { AppLanguage } from './AppLanguage';

// Everything the pipeline needs to know, collected ONCE (flags first, prompts
// for whatever is still missing) before any step runs: steps never prompt.
export type CreateQpqAppAnswers = {
  appName: string;
  language: AppLanguage;
  domain: string;
  initialiseGit: boolean;
  installDependencies: boolean;
};
