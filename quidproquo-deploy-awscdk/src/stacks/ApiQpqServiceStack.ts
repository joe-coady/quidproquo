import { Construct } from 'constructs';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

export interface ApiQpqServiceStackProps extends QpqServiceStackProps {}

export class ApiQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: ApiQpqServiceStackProps) {
    super(scope, id, props);
  }
}
