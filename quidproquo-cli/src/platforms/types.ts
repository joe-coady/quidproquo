import { QpqAppDeployEnvironment } from 'quidproquo-deploy-awscdk';

import { DeployPlan } from '../lib/deployPrompts';

export enum QpqDeployPlatform {
  aws = 'aws',
  docker = 'docker',
}

// A deploy platform driver — everything that happens after "what to deploy"
// has been decided. `qpq go` resolves the app + environment, prompts the plan,
// then hands off here; the platform comes from the environment's entry in
// apps/<app>/deploy.config.json (default aws), so an app can move platforms
// with a config change instead of a different command.
export interface QpqPlatformDriver {
  // Prime process.env with this platform's deploy identity from the resolved
  // environment target (already-set env vars win). Service configs read these
  // vars at load time, so this runs before any infrastructure.ts is required.
  // Returns human-readable descriptions of anything still missing — deploys
  // treat that as fatal, local dev commands ignore it.
  primeDeployIdentity: (target: QpqAppDeployEnvironment | undefined) => string[];

  // Sequential deploy (`qpq go`).
  go: (appName: string, plan: DeployPlan) => Promise<void>;

  // Parallel containerized deploy (`qpq go:docker`) — optional; drivers that
  // have no docker strategy simply omit it.
  goDocker?: (appName: string, plan: DeployPlan) => Promise<void>;

  // Federated remote publishing (`qpq publish[:build|:upload|:deploy]`).
  publish: (appName: string, serviceNames: string[]) => Promise<void>;
  publishBuild: (appName: string, serviceNames: string[]) => Promise<void>;
  publishUpload: (appName: string, serviceNames: string[]) => Promise<void>;
  publishDeploy: (appName: string, serviceNames: string[]) => Promise<void>;
}
