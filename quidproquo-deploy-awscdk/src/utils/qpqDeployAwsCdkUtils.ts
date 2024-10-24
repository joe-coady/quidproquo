import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import * as cdk from 'aws-cdk-lib';
import { Construct, IConstruct } from 'constructs';

export const exportStackValue = (scope: Construct, uniqueKey: string, value: string): cdk.CfnOutput => {
  return new cdk.CfnOutput(scope, uniqueKey, {
    exportName: uniqueKey,
    value,
  });
};

export const importStackValue = (uniqueKey: string): string => {
  return cdk.Fn.importValue(uniqueKey);
};

export const applyEnvironmentTags = (scope: IConstruct, qpqConfig: QPQConfig) => {
  cdk.Tags.of(scope).add('environment', qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig));
  cdk.Tags.of(scope).add('application', qpqCoreUtils.getApplicationName(qpqConfig));
  cdk.Tags.of(scope).add('module', qpqCoreUtils.getApplicationModuleName(qpqConfig));

  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);
  if (feature) {
    cdk.Tags.of(scope).add('feature', feature);
  }
};
