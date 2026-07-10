import { AppLanguage, CreateQpqAppStep } from '../types';

// Placeholder for the JavaScript flavour — a later pass will transpile the
// scaffolded TypeScript sources here. For now it's an honest no-op so the
// language answer already threads through the pipeline.
export const transpileToJavaScript: CreateQpqAppStep = {
  name: 'Converting to JavaScript',

  shouldRun: (answers) => answers.language === AppLanguage.javascript,

  run: async () => {
    console.log('  JavaScript output is not available yet — generating TypeScript for now.');
  },
};
