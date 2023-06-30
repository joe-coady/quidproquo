import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_lambda } from 'aws-cdk-lib';
import { getLambdaLayersWithFullPaths } from 'quidproquo-config-aws';

export interface LambdaLayersProps extends QpqConstructBlockProps {}

export class LambdaLayers extends QpqConstructBlock {
  public readonly layers: aws_lambda.ILayerVersion[];

  constructor(scope: Construct, id: string, props: LambdaLayersProps) {
    super(scope, id, props);

    const apiLayers = getLambdaLayersWithFullPaths(props.qpqConfig);

    this.layers = apiLayers.map((layer) => {
      return layer.buildPath
        ? new aws_lambda.LayerVersion(this, `${layer.name}-layer`, {
            layerVersionName: awsNamingUtils.getQpqRuntimeResourceNameFromConfig(
              layer.name,
              props.qpqConfig,
            ),
            code: new aws_lambda.AssetCode(layer.buildPath),
            compatibleRuntimes: [aws_lambda.Runtime.NODEJS_18_X],
          })
        : aws_lambda.LayerVersion.fromLayerVersionArn(
            this,
            `${layer.name}-layer-ref`,
            layer.layerArn!,
          );
    });
  }
}
