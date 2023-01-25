import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QPQConfig, QPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';

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

  environment() {
    return qpqCoreUtils.getAppFeature(this.qpqConfig);
  }

  service() {
    return qpqCoreUtils.getAppName(this.qpqConfig);
  }

  deploymentPrefix() {
    return `${this.service()}-${this.environment()}`;
  }

  resourceName(name: string, maxLength: number = 60) {
    return `${name}-${this.service()}-${this.environment()}`;
  }

  childId(uniqueName: string) {
    return `${uniqueName}-${this.id}`;
  }
}
