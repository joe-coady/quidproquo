import { QPQConfigSetting } from 'quidproquo-core';
import { Construct } from 'constructs';

import { QpqConstructBaseProps, QpqConstructBase } from './QpqConstructBase';

export interface QpqConstructProps<T extends QPQConfigSetting> extends QpqConstructBaseProps {
  setting: T;
  awsAccountId: string;
}

export class QpqConstruct<T extends QPQConfigSetting> extends QpqConstructBase {
  setting: T;

  constructor(scope: Construct, id: string, props: QpqConstructProps<T>) {
    super(scope, id, props);

    this.setting = props.setting;
  }
}
