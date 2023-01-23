import { Construct } from 'constructs';
import { QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { QpqServiceStack, QpqServiceStackProps } from './constructs/core/QPQServiceStack';

import qpqSettingConstructMap from './QpqSettingConstructMap';
import { createConstructs } from './utils';

export interface WebQPQServiceStackProps extends QpqServiceStackProps {}

const webQPQServiceStackOwnedSettings: string[] = [
  QPQWebServerConfigSettingType.WebEntry,
  QPQWebServerConfigSettingType.WebEntry,
];

export class WebQPQServiceStack extends QpqServiceStack {
  constructor(scope: Construct, id: string, props: WebQPQServiceStackProps) {
    super(scope, id, props);

    console.log('Creating: WebQPQServiceStack');

    createConstructs(
      this,
      props.qpqConfig,
      webQPQServiceStackOwnedSettings,
      qpqSettingConstructMap,
    );
  }
}
