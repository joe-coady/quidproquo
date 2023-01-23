import { QPQConfig, QPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { Construct } from 'constructs';

export interface QpqConstructProps<T extends QPQConfigSetting> {
  setting: T;
  qpqConfig: QPQConfig;
}

export class QpqConstruct<T extends QPQConfigSetting> extends Construct {
  qpqConfig: QPQConfig;
  id: string;

  static getUniqueId(setting: QPQConfigSetting): string {
    throw new Error('Implement getUniqueId in config: ' + setting.configSettingType);
  }

  constructor(scope: Construct, id: string, props: QpqConstructProps<T>) {
    super(scope, id);

    this.qpqConfig = props.qpqConfig;
    this.id = id;
  }

  environment() {
    return qpqCoreUtils.getAppFeature(this.qpqConfig);
  }

  service() {
    return qpqCoreUtils.getAppName(this.qpqConfig);
  }

  deploymentPrefix() {
    return `${this.service()}-${this.environment()}`;
  }

  resourceName(name: string, maxLength: number = 60) {
    return `${name}-${this.service()}-${this.environment()}`;
  }

  childId(uniqueName: string) {
    return `${uniqueName}-${this.id}`;
  }

  fromOtherStack() {}
}
