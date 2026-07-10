export enum AppLanguage {
  typescript = 'typescript',
  javascript = 'javascript',
}

// Everything the pipeline needs to know, collected ONCE (flags first, prompts
// for whatever is still missing) before any step runs — steps never prompt.
export interface CreateQpqAppAnswers {
  appName: string;
  language: AppLanguage;
  domain: string;
  initialiseGit: boolean;
  installDependencies: boolean;
}

export interface StepContext {
  // Absolute path of the directory being scaffolded (<cwd>/<appName>).
  targetDirectory: string;
  // Absolute path of the bundled template snapshot (a pruned quidproquojs.com).
  templateDirectory: string;
  // create-qpq-app's own version — the generated app pins its quidproquo-*
  // dependencies to this (the packages are published in lockstep).
  ownVersion: string;
  answers: CreateQpqAppAnswers;
}

// A self-contained scaffolding step. The pipeline always runs the same list
// top to bottom; each step owns its applicability via shouldRun.
export interface CreateQpqAppStep {
  name: string;
  shouldRun?: (answers: CreateQpqAppAnswers) => boolean;
  run: (context: StepContext) => Promise<void>;
}
