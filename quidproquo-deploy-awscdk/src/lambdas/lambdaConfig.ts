import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { QPQAWSResourceMap, getParameter } from 'quidproquo-actionprocessor-awslambda';

import { qpqWebServerUtils } from 'quidproquo-webserver';

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
    qpqWebServerUtils.getDeployRegion(qpqConfig),
  );

  return {
    awsResourceMap: JSON.parse(param),
    qpqConfig: qpqConfig,
  };
};
