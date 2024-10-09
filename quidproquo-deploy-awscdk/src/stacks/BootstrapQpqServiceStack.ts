import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { Construct } from 'constructs';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

import { BootstrapQpqCoreVirtualNetworkConstruct, BootstrapQpqWebserverApiConstruct } from '../constructs';
import { BSQpqLambdaWarmerEventConstructConstruct } from '../constructs/basic/BSQpqLambdaWarmerEventConstruct';

export interface BootstrapQpqServiceStackProps extends QpqServiceStackProps {}

export class BootstrapQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: BootstrapQpqServiceStackProps) {
    super(scope, id, props);

    new BSQpqLambdaWarmerEventConstructConstruct(this, 'LambdaWarmer', {
      awsAccountId: props.awsAccountId,
      qpqConfig: props.qpqConfig,
    });

    const apis = qpqWebServerUtils.getApiConfigs(props.qpqConfig).map(
      (setting) =>
        new BootstrapQpqWebserverApiConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          apiConfig: setting,
        }),
    );

    const virtualNetworks = qpqCoreUtils.getVirualNetworkConfigs(props.qpqConfig).map(
      (setting) =>
        new BootstrapQpqCoreVirtualNetworkConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          virtualNetworkConfig: setting,
        }),
    );
  }
}
