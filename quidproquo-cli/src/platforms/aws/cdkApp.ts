import path from 'path';

import { getOwnPackageRoot } from '../../lib/packageRoot';

// The CDK app command (`cdk ... --app "<this>"`): quidproquo-deploy-awscdk's
// generic workspace app under ts-node hooks, with DEPLOY_* in the env.
export const getCdkAppCommand = (): string => {
  // Resolve ts-node from this package, not the workspace cwd — under npm link
  // the CLI's dependencies are never hoisted into the workspace's node_modules,
  // so a bare `-r ts-node/...` preload fails there.
  const tsNodeRegister = require.resolve('ts-node/register/transpile-only');
  const cdkAppScript = path.join(getOwnPackageRoot(), 'lib', 'commonjs', 'bin', 'qpqCdkApp.js');
  return `node -r "${tsNodeRegister}" "${cdkAppScript}"`;
};

// The docker build context for the go:docker deployer image.
export const getDockerDir = (): string => path.join(getOwnPackageRoot(), 'docker', 'cdk-deployer');
