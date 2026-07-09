import path from 'path';

import { getOwnPackageRoot } from '../../lib/packageRoot';

// The CDK app command (`cdk ... --app "<this>"`): quidproquo-deploy-awscdk's
// generic workspace app under ts-node hooks, with DEPLOY_* in the env.
export const getCdkAppCommand = (): string => {
  const cdkAppScript = path.join(getOwnPackageRoot(), 'lib', 'commonjs', 'bin', 'qpqCdkApp.js');
  return `node -r ts-node/register/transpile-only "${cdkAppScript}"`;
};

// The docker build context for the go:docker deployer image.
export const getDockerDir = (): string => path.join(getOwnPackageRoot(), 'docker', 'cdk-deployer');
