import { Construct } from 'constructs';

import {
  QPQCoreConfigSettingType,
  qpqCoreUtils,
  ParameterQPQConfigSetting,
  defineParameter,
} from 'quidproquo-core';

import { QPQConfig } from 'quidproquo-core';
import { QpqResource } from './constructs/core/QpqResource';
import { QpqCoreParameterConstruct } from './constructs/QpqCoreParameterConstruct';

export const getResourceName = (name: string, qpqConfig: QPQConfig) => {
  const service = qpqCoreUtils.getAppName(qpqConfig);
  const environment = qpqCoreUtils.getAppFeature(qpqConfig);

  return `${name}-${service}-${environment}`;
};

// Get resources that we can use to grant permissions to lambdas etc
export const getQqpGrantableResources = (
  scope: Construct,
  id: string,
  qpqConfig: QPQConfig,
): QpqResource[] => {
  const parameterSettings = [
    ...qpqCoreUtils.getConfigSettings<ParameterQPQConfigSetting>(
      qpqConfig,
      QPQCoreConfigSettingType.parameter,
    ),

    defineParameter('qpq-aws-resource-map'),
  ];

  console.log(JSON.stringify(parameterSettings, null, 2));

  const parameterResources = parameterSettings.map((parameterSetting) => {
    return QpqCoreParameterConstruct.fromOtherStack(
      scope,
      `${id}-${qpqCoreUtils.getUniqueKeyForSetting(parameterSetting)}-grantable`,
      qpqConfig,
      parameterSetting,
    );
  });

  return [...parameterResources];
};
