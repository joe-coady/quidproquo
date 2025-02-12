import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { ApiLayer, getAwsServiceAccountInfoConfig } from 'quidproquo-config-aws';
import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';

export const getLambdaLayersWithFullPaths = (qpqConfig: QPQConfig): ApiLayer[] => {
  const awsServiceAccountInfoConfig = getAwsServiceAccountInfoConfig(qpqConfig);

  return awsServiceAccountInfoConfig.apiLayers.map((layer: ApiLayer) => ({
    name: layer.name,
    buildPath: layer.buildPath ? path.join(qpqCoreUtils.getConfigRoot(qpqConfig), layer.buildPath) : undefined,
    layerArn: layer.layerArn,
  }));
};

export interface LambdaLayersProps extends QpqConstructBlockProps {}

export class LambdaLayers extends QpqConstructBlock {
  public readonly layers: aws_lambda.ILayerVersion[];

  constructor(scope: Construct, id: string, props: LambdaLayersProps) {
    super(scope, id, props);

    const apiLayers = getLambdaLayersWithFullPaths(props.qpqConfig);

    this.layers = apiLayers.map((layer) => {
      return layer.buildPath
        ? new aws_lambda.LayerVersion(this, `${layer.name}-layer`, {
            layerVersionName: awsNamingUtils.getQpqRuntimeResourceNameFromConfig(layer.name, props.qpqConfig),
            code: new aws_lambda.AssetCode(layer.buildPath),
            compatibleRuntimes: [aws_lambda.Runtime.NODEJS_18_X],
          })
        : aws_lambda.LayerVersion.fromLayerVersionArn(this, `${layer.name}-layer-ref`, layer.layerArn!);
    });
  }
}
