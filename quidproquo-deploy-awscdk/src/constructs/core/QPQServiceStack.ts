import { Stack, StackProps, aws_lambda } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { QPQConfig, qpqCoreUtils, QPQConfigSetting } from 'quidproquo-core';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { QpqConstructProps } from './QpqConstruct';
import { ApiLayer } from '../../layers/ApiLayer';

export interface QpqServiceStackProps extends StackProps {
  account: string;
  qpqConfig: QPQConfig;
  apiLayers?: ApiLayer[];
}

export class QpqServiceStack extends Stack {
  id: string;
  qpqConfig: QPQConfig;
  apiLayerVersions?: aws_lambda.ILayerVersion[];

  constructor(
    scope: Construct,
    id: string,
    { account, qpqConfig, apiLayers }: QpqServiceStackProps,
  ) {
    super(scope, id, {
      env: {
        account: account,
        region: qpqCoreUtils.getDeployRegion(qpqConfig),
      },
    });

    this.id = id;
    this.qpqConfig = qpqConfig;
    this.apiLayerVersions = (apiLayers || []).map((layer) => {
      return new aws_lambda.LayerVersion(this, `${layer.name}-layer`, {
        layerVersionName: awsNamingUtils.getQpqRuntimeResourceName(layer.name, qpqConfig),
        code: new aws_lambda.AssetCode(layer.buildPath),
        compatibleRuntimes: [aws_lambda.Runtime.NODEJS_16_X],
      });
    });
  }

  childProps(setting: QPQConfigSetting): QpqConstructProps<any> {
    return {
      qpqConfig: this.qpqConfig,
      apiLayerVersions: this.apiLayerVersions,
      setting,
    };
  }
}
