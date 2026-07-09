// `qpq hooks <name>` — run the `qpq:<name>` script of every app that defines
// one (apps/<app>/package.json). Wire the root package.json's lifecycle to it,
// e.g. "postinstall": "qpq hooks postinstall".
import { runAppHookForAllApps } from '../lib/hooks';

export const hooksCommand = async (argv: string[]): Promise<void> => {
  const [hook] = argv.filter((a) => !a.startsWith('--'));

  if (!hook) {
    console.error('Usage: qpq hooks <name>   (runs qpq:<name> in every app that defines it)');
    process.exit(1);
  }

  await runAppHookForAllApps(hook);
};
