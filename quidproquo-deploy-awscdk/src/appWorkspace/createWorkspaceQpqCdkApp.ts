import * as cdk from 'aws-cdk-lib';
import fs from 'fs';
import path from 'path';

import { createQPQApp } from '../QPQApp';
import {
  AccountQpqStack,
  ApiQpqServiceStack,
  BootstrapQpqServiceStack,
  DomainQpqServiceStack,
  InfQpqServiceStack,
  WebQpqServiceStack,
} from '../stacks';
import * as qpqDeployAwsCdkUtils from '../utils';
import { getWorkspaceAccountQpqConfig, getWorkspaceBootstrapQpqConfig, getWorkspaceServiceQpqConfig } from './getWorkspaceQpqConfigs';
import { getQpqAppDeployContext } from './qpqAppDeployConfig';

// Walk up from cwd to the workspace root (the directory with an apps/ folder).
export const findWorkspaceRoot = (startDir: string = process.cwd()): string => {
  let dir = startDir;
  while (!fs.existsSync(path.join(dir, 'apps')) || !fs.existsSync(path.join(dir, 'package.json'))) {
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error('Could not find workspace root (a directory containing apps/ and package.json)');
    dir = parent;
  }
  return dir;
};

// The generic CDK app for a QPQ app workspace — the same stacks for every
// product; everything app-specific comes from apps/<app>/ (deploy.config.json
// + optional account.qpq.ts / bootstrap.qpq.ts fragments).
//
// Driven by environment variables set by the invoking tool (`qpq go`):
//   DEPLOY_APP_NAME      (required) app folder under apps/
//   DEPLOY_SERVICE_NAME  (optional) also synth the service's inf/web/api stacks
//   ENVIRONMENT          (required) environment name in deploy.config.json
//   ACTOR_NAME           (optional) actor/feature deploys
//   AWS_DEFAULT_ACCOUNT / AWS_DEFAULT_REGION (optional) identity override
export const createWorkspaceQpqCdkApp = (): cdk.App => {
  const root = findWorkspaceRoot();

  const deployAppName = process.env.DEPLOY_APP_NAME;
  if (!deployAppName) {
    throw new Error('DEPLOY_APP_NAME environment variable is not set.');
  }

  const environment = process.env.ENVIRONMENT;
  if (!environment) {
    throw new Error('ENVIRONMENT environment variable is not set.');
  }

  const ctx = getQpqAppDeployContext(root, deployAppName, environment, process.env.ACTOR_NAME, {
    accountId: process.env.AWS_DEFAULT_ACCOUNT,
    region: process.env.AWS_DEFAULT_REGION,
  });

  const app = createQPQApp();

  // Account-level guardrails - one statically named stack per AWS account,
  // independent of any app. Exactly one repo/config owns this per account, and
  // actor deploys must not deploy it.
  new AccountQpqStack(app, qpqDeployAwsCdkUtils.getAccountStackName(), {
    qpqConfig: getWorkspaceAccountQpqConfig(ctx),
  });

  // Bootstrapping stacks — deploy when their config changes.
  const bootstrapQpqConfig = getWorkspaceBootstrapQpqConfig(ctx);

  new DomainQpqServiceStack(app, qpqDeployAwsCdkUtils.getDomainStackName(bootstrapQpqConfig), {
    qpqConfig: bootstrapQpqConfig,
  });

  new BootstrapQpqServiceStack(app, qpqDeployAwsCdkUtils.getBootstrapStackName(bootstrapQpqConfig), {
    qpqConfig: bootstrapQpqConfig,
  });

  if (process.env.DEPLOY_SERVICE_NAME) {
    const qpqConfig = getWorkspaceServiceQpqConfig(root, deployAppName, process.env.DEPLOY_SERVICE_NAME);

    new InfQpqServiceStack(app, qpqDeployAwsCdkUtils.getInfStackName(qpqConfig), {
      qpqConfig,
    });
    new WebQpqServiceStack(app, qpqDeployAwsCdkUtils.getWebStackName(qpqConfig), {
      qpqConfig,
    });
    new ApiQpqServiceStack(app, qpqDeployAwsCdkUtils.getApiStackName(qpqConfig), {
      qpqConfig,
    });
  }

  return app;
};
