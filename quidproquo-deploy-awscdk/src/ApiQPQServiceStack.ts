import { Construct } from 'constructs';
import { QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { QpqServiceStack, QpqServiceStackProps } from './constructs/core/QPQServiceStack';

import qpqSettingConstructMap from './QpqSettingConstructMap';
import { createConstructs } from './utils';
import { InfrastructureQPQServiceStack } from './InfrastructureQPQServiceStack';
import { ApiLayer } from './layers/ApiLayer';
import { Scheduler } from './constructs/basic/Scheduler';

export interface ApiQPQServiceStackProps extends QpqServiceStackProps {
  infrastructureQPQServiceStack: InfrastructureQPQServiceStack;
}

const apiQPQServiceStackOwnedSettings: string[] = [QPQWebServerConfigSettingType.Api];

export class ApiQPQServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: ApiQPQServiceStackProps) {
    super(scope, id, props);

    this.addDependency(props.infrastructureQPQServiceStack);

    createConstructs(
      this,
      props.qpqConfig,
      apiQPQServiceStackOwnedSettings,
      qpqSettingConstructMap,
      props.apiLayers,
    );

    // Regular constructs
    new Scheduler(scope, this.childId('scheduler'), {
      qpqConfig: props.qpqConfig,
      apiLayers: props.apiLayers,
    });
  }
}
