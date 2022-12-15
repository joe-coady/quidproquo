import { QPQConfig } from 'quidproquo-core';
import { DeploymentType } from './DeploymentType';

export interface DeploymentSettings {
  environment: DeploymentType;

  qpqConfig: QPQConfig;
}
