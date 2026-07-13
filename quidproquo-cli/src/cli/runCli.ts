const usage = `qpq — build, dev and deploy orchestration for QPQ apps

Usage: qpq <command> [--app <name>] [--env <name>] [--platform <name>]

Commands:
  go [svc] [stack] Deploy services (interactive; platform from deploy.config.json, default aws).
                   Pass positional args to skip prompts, e.g. qpq go all all — svc is
                   'all' | comma-list | account | domain | bootstrap; stack is all|inf|api|web|views.
                   A full 'all all' (or 'all api') deploy also publishes federated backends.
  go:docker        Same as go (incl. positional args), but deploys in parallel via docker
  go:dev           Run the full local dev stack (api + web) in one process
  go:dev:api       Run the local API dev server (hot reload)
  go:dev:web       Run every views microfrontend dev server
  teardown         Destroy web/api/inf stacks for selected services (interactive)
  synth [service]  Synth QPQ configs to dist/apps/<app>/infrastructure
  prep             Regenerate apps/<app>/tsconfig.federated.json
  publish          Build + upload + deploy federated remotes
  publish:build    Build federated remotes locally
  publish:upload   Upload built version dirs (nothing goes live)
  publish:deploy   Flip manifests to the uploaded versions
  hooks <name>     Run qpq:<name> in every app that defines it
`;

// Service infrastructure.ts files (and app config fragments) are TypeScript —
// register ts-node's transpile-only require hook so the CLI can require them
// directly, using the consumer root's tsconfig.json ts-node settings.
//
// CONTRACT: JavaScript apps (create-qpq-app --language javascript) also lean
// on this hook — their tsconfig.json ts-node block sets allowJs (so their
// ESM-syntax infrastructure.js compiles at require time) and scope/scopeDir
// (so the hook never touches quidproquo libs outside the app). Any
// replacement for ts-node here must honour those consumer tsconfig options.
const registerTsNode = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('ts-node').register({ transpileOnly: true });
};

export const runCli = async (argv: string[]): Promise<void> => {
  const [command, ...commandArgv] = argv;

  if (!command || command === 'help' || command === '--help') {
    console.log(usage);
    return;
  }

  registerTsNode();

  // Commands are required lazily so a simple `qpq help` doesn't pay for the
  // whole toolchain, and so ts-node is registered before any command module
  // (or anything it requires) loads.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const commands: Record<string, (commandArgv: string[]) => Promise<void>> = {
    go: (a) => require('../commands/go').goCommand(a),
    'go:docker': (a) => require('../commands/goDocker').goDockerCommand(a),
    'go:dev': (a) => require('../commands/goDev').goDevCommand(a),
    'go:dev:api': (a) => require('../commands/goDevApi').goDevApiCommand(a),
    'go:dev:web': (a) => require('../commands/goDevWeb').goDevWebCommand(a),
    teardown: (a) => require('../commands/teardown').teardownCommand(a),
    synth: (a) => require('../commands/synth').synthCommand(a),
    prep: (a) => require('../commands/prep').prepCommand(a),
    publish: (a) => require('../commands/publish').publishCommand(a),
    'publish:build': (a) => require('../commands/publish').publishBuildCommand(a),
    'publish:upload': (a) => require('../commands/publish').publishUploadCommand(a),
    'publish:deploy': (a) => require('../commands/publish').publishDeployCommand(a),
    hooks: (a) => require('../commands/hooks').hooksCommand(a),
  };
  /* eslint-enable @typescript-eslint/no-require-imports */

  const run = commands[command];

  if (!run) {
    console.error(`Unknown command: ${command}`);
    console.log(usage);
    process.exitCode = 1;
    return;
  }

  try {
    await run(commandArgv);
  } catch (error) {
    console.error(`qpq ${command} failed:`, error);
    process.exitCode = 1;
  }
};
