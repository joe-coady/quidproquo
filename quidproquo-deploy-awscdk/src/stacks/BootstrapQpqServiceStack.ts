import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { qpqCoreUtils } from 'quidproquo-core';

import { Construct } from 'constructs';

import {
  BootstrapQpqCoreVirtualNetworkConstruct,
  QpqBootstrapConfigAwsOrganizationConstruct,
  QpqBootstrapConfigBudgetConstruct,
  QpqBootstrapConfigCloudTrailConstruct,
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

    const cloudTrails = qpqConfigAwsUtils.getBootstrapCloudTrailConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqBootstrapConfigCloudTrailConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          cloudTrailConfig: setting,
        }),
    );

    const budgets = qpqConfigAwsUtils.getBootstrapBudgetConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqBootstrapConfigBudgetConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          qpqConfig: props.qpqConfig,

          budgetConfig: setting,
        }),
    );
  }
}
