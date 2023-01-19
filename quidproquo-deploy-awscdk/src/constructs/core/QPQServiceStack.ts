import { Stack, StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { QPQConfig, qpqCoreUtils, QPQConfigSetting } from 'quidproquo-core';
import { QpqConstructProps } from './QpqConstruct';

export interface QpqServiceStackProps extends StackProps {
  account: string;
  qpqConfig: QPQConfig;
}

export class QpqServiceStack extends Stack {
  id: string;
  qpqConfig: QPQConfig;

  constructor(scope: Construct, id: string, { account, qpqConfig }: QpqServiceStackProps) {
    super(scope, id, {
      env: {
        account: account,
        region: qpqCoreUtils.getDeployRegion(qpqConfig),
      },
    });

    this.id = id;
    this.qpqConfig = qpqConfig;
  }

  childId(uniqueName: string) {
    return `${uniqueName}-${this.id}`;
  }

  childProps(setting: QPQConfigSetting): QpqConstructProps<any> {
    return {
      qpqConfig: this.qpqConfig,
      setting,
    };
  }
}
