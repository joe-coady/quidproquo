import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { QPQAWSResourceMap, getParameter } from 'quidproquo-actionprocessor-awslambda';

// @ts-ignore
import qpqConfig from 'qpq-config-loader!';

export interface QPQCDKConfig {
  awsResourceMap: QPQAWSResourceMap;
  qpqConfig: QPQConfig;
}

export const getLambdaConfigs = async (): Promise<QPQCDKConfig> => {
  const service = qpqCoreUtils.getAppName(qpqConfig);
  const environment = qpqCoreUtils.getAppFeature(qpqConfig);

  const param = await getParameter(
    `qpq-aws-resource-map-${service}-${environment}`,
    qpqCoreUtils.getDeployRegion(qpqConfig),
  );

  return {
    awsResourceMap: JSON.parse(param),
    qpqConfig: qpqConfig,
  };
};
