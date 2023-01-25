import { QPQConfig, QPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { Construct } from 'constructs';
import { ApiLayer } from '../../layers/ApiLayer';

export interface QpqConstructBaseProps {
  qpqConfig: QPQConfig;
  apiLayers?: ApiLayer[];
}

export class QpqConstructBase extends Construct {
  id: string;
  qpqConfig: QPQConfig;
  apiLayers?: ApiLayer[];

  constructor(scope: Construct, id: string, props: QpqConstructBaseProps) {
    super(scope, id);

    this.id = id;
    this.qpqConfig = props.qpqConfig;
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
    console.log(`resource name for [${name}] - [${name}-${this.service()}-${this.environment()}]`);
    return `${name}-${this.service()}-${this.environment()}`;
  }

  childId(uniqueName: string) {
    return `${uniqueName}-${this.id}`;
  }
}
