import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_lambda } from 'aws-cdk-lib';

export interface ApiLayer {
  buildPath: string;
  name: string;
}

export interface LambdaLayersProps extends QpqConstructBlockProps {
  apiLayers?: ApiLayer[];
}

export class LambdaLayers extends QpqConstructBlock {
  public readonly layers: aws_lambda.ILayerVersion[];

  constructor(scope: Construct, id: string, props: LambdaLayersProps) {
    super(scope, id, props);

    this.layers = [];
  }
}
