import fs from 'fs';
import path from 'path';

// This package's root (works from src under ts-node and from lib/commonjs).
export const getOwnPackageRoot = (): string => {
  let dir = __dirname;
  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error('Could not locate the quidproquo-cli package root');
    dir = parent;
  }
  return dir;
};

// The CDK app command (`cdk ... --app "<this>"`): quidproquo-deploy-awscdk's
// generic workspace app under ts-node hooks, with DEPLOY_* in the env.
export const getCdkAppCommand = (): string => {
  const cdkAppScript = path.join(getOwnPackageRoot(), 'lib', 'commonjs', 'bin', 'qpqCdkApp.js');
  return `node -r ts-node/register/transpile-only "${cdkAppScript}"`;
};

// The docker build context for the go:docker deployer image.
export const getDockerDir = (): string => path.join(getOwnPackageRoot(), 'docker');
