import { Stack, StackProps, aws_lambda } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { QPQConfig, qpqCoreUtils, QPQConfigSetting } from 'quidproquo-core';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

export interface QpqServiceStackProps {
  awsAccountId: string;
  qpqConfig: QPQConfig;
}

export class QpqServiceStack extends Stack {
  awsAccountId: string;
  qpqConfig: QPQConfig;

  constructor(scope: Construct, id: string, props: QpqServiceStackProps) {
    super(scope, id, {
      env: {
        account: props.awsAccountId,
        region: qpqCoreUtils.getApplicationModuleDeployRegion(props.qpqConfig),
      },
    });

    this.awsAccountId = props.awsAccountId;
    this.qpqConfig = props.qpqConfig;
  }

  resourceName(name: string) {
    return awsNamingUtils.getConfigRuntimeResourceNameFromConfig(name, this.qpqConfig);
  }
}
