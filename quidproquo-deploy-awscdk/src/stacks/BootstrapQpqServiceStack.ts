import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { Construct } from 'constructs';

import {
  BootstrapQpqCoreVirtualNetworkConstruct,
  BootstrapQpqWebserverApiConstruct,
  QpqBootstrapConfigAwsOrganizationConstruct,
} from '../constructs';
import { BSQpqLambdaWarmerEventConstructConstruct } from '../constructs/basic/BSQpqLambdaWarmerEventConstruct';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

export interface BootstrapQpqServiceStackProps extends QpqServiceStackProps {}

export class BootstrapQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: BootstrapQpqServiceStackProps) {
    super(scope, id, props);

    new BSQpqLambdaWarmerEventConstructConstruct(this, 'LambdaWarmer', {
      qpqConfig: props.qpqConfig,
    });

    const apis = qpqWebServerUtils.getApiConfigs(props.qpqConfig).map(
      (setting) =>
        new BootstrapQpqWebserverApiConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          apiConfig: setting,
        }),
    );

    const virtualNetworks = qpqCoreUtils.getVirualNetworkConfigs(props.qpqConfig).map(
      (setting) =>
        new BootstrapQpqCoreVirtualNetworkConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          virtualNetworkConfig: setting,
        }),
    );

    const organiaztions = qpqConfigAwsUtils.getAwsBootstrapOrganizationConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqBootstrapConfigAwsOrganizationConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          awsOrganizationConfig: setting,
        }),
    );
  }
}
