import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { Construct } from 'constructs';
import { QpqServiceStack, QpqServiceStackProps } from './base/QpqServiceStack';

import { InfQpqServiceStack } from './InfQpqServiceStack';
import {
  LambdaLayers,
  QpqCoreRecurringScheduleConstruct,
  QpqWebserverApiConstruct,
  QpqApiCoreQueueConstruct,
  QpqWebserverSubdomainRedirectConstruct,
  QpqWebserverServiceFunctionConstruct,
  QpqApiWebserverWebsocketConstruct
} from '../constructs';

export interface ApiQpqServiceStackProps extends QpqServiceStackProps {
  infQpqServiceStack?: InfQpqServiceStack;
}

export class ApiQpqServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: ApiQpqServiceStackProps) {
    super(scope, id, props);

    // Add the inf stack as a dependency so it builds first
    if (props.infQpqServiceStack) {
      this.addDependency(props.infQpqServiceStack);
    }

    // Build Lambda Layers
    const layers = new LambdaLayers(this, 'lambda-layers', {
      awsAccountId: props.awsAccountId,
      qpqConfig: props.qpqConfig,
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

    // Queues
    const redirects = qpqWebServerUtils.getSubdomainRedirects(props.qpqConfig).map(
      (setting) =>
        new QpqWebserverSubdomainRedirectConstruct(
          this,
          qpqCoreUtils.getUniqueKeyForSetting(setting),
          {
            awsAccountId: props.awsAccountId,
            qpqConfig: props.qpqConfig,

            subdomainRedirectConfig: setting,
          },
        ),
    );

    // Service Functions
    const serviceFunctions = qpqWebServerUtils.getAllServiceFunctions(props.qpqConfig).map(
      (setting) =>
        new QpqWebserverServiceFunctionConstruct(
          this,
          qpqCoreUtils.getUniqueKeyForSetting(setting),
          {
            awsAccountId: props.awsAccountId,
            qpqConfig: props.qpqConfig,

            serviceFunctionConfig: setting,
            apiLayerVersions: layers.layers,
          },
        ),
    );

     // Build websocket apis
     const websockets = qpqWebServerUtils.getWebsocketSettings(props.qpqConfig).map(
      (setting) =>
        new QpqApiWebserverWebsocketConstruct(this, qpqCoreUtils.getUniqueKeyForSetting(setting), {
          awsAccountId: props.awsAccountId,
          qpqConfig: props.qpqConfig,

          websocketConfig: setting,
        }),
    );
  }
}
