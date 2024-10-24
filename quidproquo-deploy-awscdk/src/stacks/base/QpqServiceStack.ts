import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { QPQConfig, QPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';

import { aws_lambda, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

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
        region: qpqConfigAwsUtils.getApplicationModuleDeployRegion(props.qpqConfig),
      },
    });

    this.awsAccountId = props.awsAccountId;
    this.qpqConfig = props.qpqConfig;
  }

  resourceName(name: string) {
    return awsNamingUtils.getConfigRuntimeResourceNameFromConfig(name, this.qpqConfig);
  }
}
