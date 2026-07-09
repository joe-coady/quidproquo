// Host-side `cdk deploy` helpers. No cdk.json anywhere: the CDK app command is
// passed via --app and runs quidproquo-deploy-awscdk's generic workspace app
// (bin/qpq-cdk-app.js) under ts-node hooks, with DEPLOY_* in the env.
import { qpqDeployAwsCdkUtils } from 'quidproquo-deploy-awscdk';

import path from 'path';

import { getRoot, getServiceNames } from '../../lib/discovery';
import { getAppPrefix, loadServiceQpqConfig } from '../../lib/qpqConfigs';
import { runCommand } from '../../lib/runCommand';
import { logTimeEnd, logTimeStart } from '../../lib/timing';
import { getCdkAppCommand } from './cdkApp';

export const deployStack = async (stackName: string, env: Record<string, string> = {}): Promise<void> => {
  logTimeStart(stackName);
  await runCommand(
    'npx',
    ['cdk', 'deploy', stackName, '--require-approval', 'never', '--app', `'${getCdkAppCommand()}'`, '--output', path.join('dist', 'qpq', 'cdk.out')],
    {
      cwd: getRoot(),
      env,
    },
  );
  logTimeEnd(stackName);
};

export const deployServiceStack = (serviceName: string, stackName: string, appName: string): Promise<void> =>
  deployStack(stackName, {
    DEPLOY_SERVICE_NAME: serviceName,
    DEPLOY_APP_NAME: appName,
  });

export const deployDomainStack = async (appName: string): Promise<void> => {
  const qpqConfig = loadServiceQpqConfig(appName, getServiceNames(appName)[0]);
  const stackName = qpqDeployAwsCdkUtils.getDomainStackName(qpqConfig);
  console.log('Deploy Domain: ', stackName);
  await deployStack(stackName, {
    DEPLOY_SERVICE_NAME: '',
    DEPLOY_APP_NAME: appName,
  });
};

// Account-level guardrails stack - statically named (one per AWS account,
// app-agnostic), so no config load is needed to know the name. Callers decide
// whether an actor deploy should include it (bootstrap skips it; the explicit
// 'account' menu option always deploys).
export const deployAccountStack = async (appName: string): Promise<void> => {
  const stackName = qpqDeployAwsCdkUtils.getAccountStackName();
  console.log('Deploy Account: ', stackName);
  await deployStack(stackName, {
    DEPLOY_SERVICE_NAME: '',
    DEPLOY_APP_NAME: appName,
  });
};

export const deployBootstrapStack = async (appName: string): Promise<void> => {
  const appPrefix = getAppPrefix(appName);
  const stackName = process.env.ACTOR_NAME
    ? `${appPrefix}-${process.env.ENVIRONMENT}-${process.env.ACTOR_NAME}-bs`
    : `${appPrefix}-${process.env.ENVIRONMENT}-bs`;
  await deployStack(stackName, {
    DEPLOY_SERVICE_NAME: '',
    DEPLOY_APP_NAME: appName,
  });
};
