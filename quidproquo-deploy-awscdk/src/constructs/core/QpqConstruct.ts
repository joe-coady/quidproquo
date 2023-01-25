import { QPQConfig, QPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { Construct } from 'constructs';
import { ApiLayer } from '../../layers/ApiLayer';

export interface QpqConstructProps<T extends QPQConfigSetting> {
  setting: T;
  qpqConfig: QPQConfig;
  apiLayers?: ApiLayer[];
}

export class QpqConstruct<T extends QPQConfigSetting> extends Construct {
  qpqConfig: QPQConfig;
  id: string;
  apiLayers?: ApiLayer[];

  static getUniqueId(setting: QPQConfigSetting): string {
    throw new Error('Implement getUniqueId in config: ' + setting.configSettingType);
  }

  constructor(scope: Construct, id: string, props: QpqConstructProps<T>) {
    super(scope, id);

    this.qpqConfig = props.qpqConfig;
    this.id = id;
    this.apiLayers = props.apiLayers;
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
    console.log(`resource name for ${name} - [${name}-${this.service()}-${this.environment()}]`);
    return `${name}-${this.service()}-${this.environment()}`;
  }

  childId(uniqueName: string) {
    console.log(`child id for ${uniqueName} - [${uniqueName}-${this.id}]`);
    return `${uniqueName}-${this.id}`;
  }

  fromOtherStack() {}
}
