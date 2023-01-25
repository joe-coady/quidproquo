import { Stack, StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { QPQConfig, qpqCoreUtils, QPQConfigSetting } from 'quidproquo-core';
import { QpqConstructProps } from './QpqConstruct';
import { ApiLayer } from '../../layers/ApiLayer';

export interface QpqServiceStackProps extends StackProps {
  account: string;
  qpqConfig: QPQConfig;
  apiLayers?: ApiLayer[];
}

export class QpqServiceStack extends Stack {
  id: string;
  qpqConfig: QPQConfig;
  apiLayers?: ApiLayer[];

  constructor(
    scope: Construct,
    id: string,
    { account, qpqConfig, apiLayers }: QpqServiceStackProps,
  ) {
    super(scope, id, {
      env: {
        account: account,
        region: qpqCoreUtils.getDeployRegion(qpqConfig),
      },
    });

    this.id = id;
    this.qpqConfig = qpqConfig;
    this.apiLayers = apiLayers;
  }

  childId(uniqueName: string) {
    return `${uniqueName}-${this.id}`;
  }

  childProps(setting: QPQConfigSetting): QpqConstructProps<any> {
    return {
      qpqConfig: this.qpqConfig,
      apiLayers: this.apiLayers,
      setting,
    };
  }
}
