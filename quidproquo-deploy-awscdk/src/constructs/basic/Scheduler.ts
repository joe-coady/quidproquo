import { QpqConstructBase, QpqConstructBaseProps } from '../core/QpqConstructBase';
import { Construct } from 'constructs';
import {
  aws_route53,
  aws_certificatemanager,
  aws_apigateway,
  aws_route53_targets,
} from 'aws-cdk-lib';

export interface SchedulerProps extends QpqConstructBaseProps {}

export class Scheduler extends QpqConstructBase {
  constructor(scope: Construct, id: string, props: SchedulerProps) {
    super(scope, id, props);
  }
}
