import { Construct } from 'constructs';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

export interface WebQpqServiceStackProps extends QpqServiceStackProps {}

export class WebQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: WebQpqServiceStackProps) {
    super(scope, id, props);
  }
}
