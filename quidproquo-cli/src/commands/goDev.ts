// `qpq go:dev` — the whole local dev stack in one process: the API dev server
// (go:dev:api) plus every views dev server (go:dev:web), so a single ctrl+c
// tears it all down. The app is resolved once here and handed to both
// sub-commands via QPQ_DEV_APP; their output shares the terminal.
import { getAllViews } from 'quidproquo-deploy-rspack';

import { getRoot } from '../lib/discovery';
import { resolveAppSelection } from '../lib/resolveAppSelection';
import { goDevApiCommand } from './goDevApi';
import { goDevWebCommand } from './goDevWeb';

export const goDevCommand = async (argv: string[]): Promise<void> => {
  const appName = await resolveAppSelection({ argv, envVar: 'QPQ_DEV_APP' });
  process.env.QPQ_DEV_APP = appName;

  // Kicks off the rspack watch and returns; the API server keeps running in
  // the background of this process.
  await goDevApiCommand(argv);

  if (getAllViews(getRoot(), appName).length === 0) {
    console.log('No views projects found. Running the API dev server only.');
    return;
  }

  await goDevWebCommand(argv, { plainStatusLines: true });
};
