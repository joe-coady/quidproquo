import { Construct } from 'constructs';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

export interface InfQpqServiceStackProps extends QpqServiceStackProps {}

export class InfQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: InfQpqServiceStackProps) {
    super(scope, id, props);
  }
}
