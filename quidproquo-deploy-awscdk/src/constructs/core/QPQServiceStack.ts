import { Stack, StackProps, aws_lambda } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { QPQConfig, qpqCoreUtils, QPQConfigSetting } from 'quidproquo-core';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { QpqConstructProps } from './QpqConstruct';
import { ApiLayer } from '../../layers/ApiLayer';

export interface QpqServiceStackProps extends StackProps {
  awsAccountId: string;
  qpqConfig: QPQConfig;
  apiLayers?: ApiLayer[];
}

export class QpqServiceStack extends Stack {
  id: string;
  awsAccountId: string;
  qpqConfig: QPQConfig;
  apiLayerVersions?: aws_lambda.ILayerVersion[];

  constructor(scope: Construct, id: string, props: QpqServiceStackProps) {
    super(scope, id, {
      env: {
        account: props.awsAccountId,
        region: qpqCoreUtils.getApplicationModuleDeployRegion(props.qpqConfig),
      },
    });

    this.id = id;
    this.awsAccountId = props.awsAccountId;
    this.qpqConfig = props.qpqConfig;
    this.apiLayerVersions = (props.apiLayers || []).map((layer) => {
      return new aws_lambda.LayerVersion(this, `${layer.name}-layer`, {
        layerVersionName: awsNamingUtils.getQpqRuntimeResourceName(layer.name, props.qpqConfig),
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
      awsAccountId: this.awsAccountId,
    };
  }
}
