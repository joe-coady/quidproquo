import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QPQConfig, QPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

export interface QpqConstructBaseProps {
  qpqConfig: QPQConfig;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqConstructBase extends Construct {
  id: string;
  qpqConfig: QPQConfig;
  apiLayerVersions?: aws_lambda.ILayerVersion[];

  constructor(scope: Construct, id: string, props: QpqConstructBaseProps) {
    super(scope, id);

    this.id = id;
    this.qpqConfig = props.qpqConfig;
    this.apiLayerVersions = props.apiLayerVersions;
  }

  resourceName(name: string) {
    return awsNamingUtils.getConfigRuntimeResourceName(name, this.qpqConfig);
  }

  qpqResourceName(name: string) {
    return awsNamingUtils.getQpqRuntimeResourceName(name, this.qpqConfig);
  }
}
