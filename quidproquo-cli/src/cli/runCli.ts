const usage = `qpq — build, dev and deploy orchestration for QPQ apps

Usage: qpq <command> [--app <name>] [--env <name>] [--platform <name>]

Commands:
  go               Deploy services (interactive; platform from deploy.config.json, default aws)
  go:docker        Same as go, but deploys in parallel via docker
  go:dev           Run the local dev server (hot reload)
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
