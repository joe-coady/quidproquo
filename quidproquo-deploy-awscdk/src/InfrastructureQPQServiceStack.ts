import { Construct } from 'constructs';
import { QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { QpqServiceStack, QpqServiceStackProps } from './constructs/core/QPQServiceStack';

import qpqSettingConstructMap from './QpqSettingConstructMap';
import { createConstructs } from './utils';

export interface InfrastructureQPQServiceStackProps extends QpqServiceStackProps {}

const infrastructureQPQServiceStackOwnedSettings: string[] = [QPQWebServerConfigSettingType.Dns];

export class InfrastructureQPQServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: InfrastructureQPQServiceStackProps) {
    super(scope, id, props);

    createConstructs(
      this,
      props.qpqConfig,
      infrastructureQPQServiceStackOwnedSettings,
      qpqSettingConstructMap,
    );
  }
}
