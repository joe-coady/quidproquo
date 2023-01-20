import { Construct } from 'constructs';
import { QPQCoreConfigSettingType } from 'quidproquo-core';
import { QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { QpqServiceStack, QpqServiceStackProps } from './constructs/core/QPQServiceStack';

import qpqSettingConstructMap from './QpqSettingConstructMap';
import { createConstructs } from './utils';

export interface ApiQPQServiceStackProps extends QpqServiceStackProps {}

const apiQPQServiceStackOwnedSettings: string[] = [
  // QPQCoreConfigSettingType.storageDrive,
  // QPQCoreConfigSettingType.parameter,
  // QPQCoreConfigSettingType.secret,
];

export class ApiQPQServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: ApiQPQServiceStackProps) {
    super(scope, id, props);

    createConstructs(
      this,
      props.qpqConfig,
      apiQPQServiceStackOwnedSettings,
      qpqSettingConstructMap,
    );
  }
}
