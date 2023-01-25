import { QPQConfig, QPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { Construct } from 'constructs';
import { ApiLayer } from '../../layers/ApiLayer';

import { QpqConstructBaseProps, QpqConstructBase } from './QpqConstructBase';

export interface QpqConstructProps<T extends QPQConfigSetting> extends QpqConstructBaseProps {
  setting: T;
}

export class QpqConstruct<T extends QPQConfigSetting> extends QpqConstructBase {
  setting: T;
  // static getUniqueId(setting: QPQConfigSetting): string {
  //   throw new Error('Implement getUniqueId in config: ' + setting.configSettingType);
  // }

  constructor(scope: Construct, id: string, props: QpqConstructProps<T>) {
    super(scope, id, props);

    this.setting = props.setting;
  }
}
