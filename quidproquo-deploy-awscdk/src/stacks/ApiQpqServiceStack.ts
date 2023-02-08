import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { Construct } from 'constructs';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

import { InfQpqServiceStack } from './InfQpqServiceStack';
import {
  ApiLayer,
  LambdaLayers,
  QpqCoreRecurringScheduleConstruct,
  QpqWebserverApiConstruct,
  QpqApiCoreQueueConstruct,
} from '../constructs';

export interface ApiQpqServiceStackProps extends QpqServiceStackProps {
  infQpqServiceStack: InfQpqServiceStack;
  ApiLayers?: ApiLayer[];
}

export class ApiQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: ApiQpqServiceStackProps) {
    super(scope, id, props);

    // Add the inf stack as a dependency so it builds first
    this.addDependency(props.infQpqServiceStack);

    // Build Lambda Layers
    const layers = new LambdaLayers(this, 'lambda-layers', {
      awsAccountId: props.awsAccountId,
      qpqConfig: props.qpqConfig,

      apiLayers: props.ApiLayers,
    });

    // Schedule Events
    const scheduleEvent = qpqCoreUtils.getScheduleEvents(props.qpqConfig).map(
      (setting) =>
        new QpqCoreRecurringScheduleConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          scheduleConfig: setting,
          apiLayerVersions: layers.layers,
        }),
    );

    // Api - routes
    const apis = qpqWebServerUtils.getApiConfigs(props.qpqConfig).map(
      (setting) =>
        new QpqWebserverApiConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          apiConfig: setting,
          apiLayerVersions: layers.layers,
        }),
    );

    // Queues
    const queues = qpqCoreUtils.getQueues(props.qpqConfig).map(
      (setting) =>
        new QpqApiCoreQueueConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          queueConfig: setting,
          apiLayerVersions: layers.layers,
        }),
    );
  }
}
