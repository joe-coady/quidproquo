import { ServiceName } from "../types/serviceNameTypes";

import {
  ServiceInfrastructureConfig,
  ServiceInfrastructureConfigType,
} from "./ServiceInfrastructureConfig";

export interface ServiceNameInfrastructureConfig
  extends ServiceInfrastructureConfig {
  serviceName: ServiceName;
}

export const defineServiceName = (
  serviceName: ServiceName
): ServiceNameInfrastructureConfig => ({
  serviceInfrastructureConfigType: ServiceInfrastructureConfigType.SERVICE_NAME,

  serviceName,
});
