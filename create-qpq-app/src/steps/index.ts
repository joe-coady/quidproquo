import { CreateQpqAppStep } from '../types';
import { preflight } from './001_preflight';
import { copyTemplate } from './002_copyTemplate';
import { deleteDocusaurus } from './003_deleteDocusaurus';
import { deleteQpqjsApp } from './004_deleteQpqjsApp';
import { applyAppIdentity } from './005_applyAppIdentity';
import { applyDomain } from './006_applyDomain';
import { pinRegistryVersions } from './007_pinRegistryVersions';
import { transpileToJavaScript } from './008_transpileToJavaScript';
import { restoreGitignore } from './009_restoreGitignore';
import { gitInit } from './010_gitInit';
import { npmInstall } from './011_npmInstall';
import { buildWorkspaces } from './012_buildWorkspaces';
import { printNextSteps } from './013_printNextSteps';

// The pipeline: always this list, always this order — the numeric file
// prefixes match, so the steps directory reads top to bottom. Steps decide
// for themselves (shouldRun) whether the collected answers apply to them.
export const createQpqAppSteps: CreateQpqAppStep[] = [
  preflight,
  copyTemplate,
  deleteDocusaurus,
  deleteQpqjsApp,
  applyAppIdentity,
  applyDomain,
  pinRegistryVersions,
  transpileToJavaScript,
  restoreGitignore,
  gitInit,
  npmInstall,
  buildWorkspaces,
  printNextSteps,
];

export {
  applyAppIdentity,
  applyDomain,
  buildWorkspaces,
  copyTemplate,
  deleteDocusaurus,
  deleteQpqjsApp,
  gitInit,
  npmInstall,
  pinRegistryVersions,
  preflight,
  printNextSteps,
  restoreGitignore,
  transpileToJavaScript,
};
