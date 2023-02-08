import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { QPQConfig } from 'quidproquo-core';
import { Construct } from 'constructs';

import { QpqResource } from './QpqResource';
import { IGrantable } from 'aws-cdk-lib/aws-iam';

export interface QpqConstructBlockProps {
  awsAccountId: string;
  qpqConfig: QPQConfig;
}

export class QpqConstructBlock extends Construct implements QpqResource {
  awsAccountId: string;
  qpqConfig: QPQConfig;

  constructor(scope: Construct, id: string, props: QpqConstructBlockProps) {
    super(scope, id);

    this.awsAccountId = props.awsAccountId;
    this.qpqConfig = props.qpqConfig;
  }

  resourceName(name: string) {
    return awsNamingUtils.getConfigRuntimeResourceName(name, this.qpqConfig);
  }

  qpqResourceName(name: string, resourceType: string) {
    return awsNamingUtils.getQpqRuntimeResourceName(name, this.qpqConfig, resourceType);
  }

  grantRead(grantee: IGrantable): void {}

  grantWrite(grantee: IGrantable): void {}

  grantAll(grantee: IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}
