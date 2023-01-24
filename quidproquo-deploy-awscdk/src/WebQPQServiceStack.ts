import { Construct } from 'constructs';
import { QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { QpqServiceStack, QpqServiceStackProps } from './constructs/core/QPQServiceStack';

import qpqSettingConstructMap from './QpqSettingConstructMap';
import { createConstructs } from './utils';
import { InfrastructureQPQServiceStack } from './InfrastructureQPQServiceStack';

export interface WebQPQServiceStackProps extends QpqServiceStackProps {
  infrastructureQPQServiceStack: InfrastructureQPQServiceStack;
}

const webQPQServiceStackOwnedSettings: string[] = [QPQWebServerConfigSettingType.WebEntry];

export class WebQPQServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: WebQPQServiceStackProps) {
    super(scope, id, props);

    this.addDependency(props.infrastructureQPQServiceStack);

    createConstructs(
      this,
      props.qpqConfig,
      webQPQServiceStackOwnedSettings,
      qpqSettingConstructMap,
    );
  }
}
