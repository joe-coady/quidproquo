import {
  ServiceInfrastructureConfigType,
  ServiceInfrastructureConfig,
  ServiceInfrastructureConfigs,
} from "./serviceInfrastructureDefinitions/ServiceInfrastructureConfig";

const getServiceInfrastructureDefinitions = <
  T extends ServiceInfrastructureConfig
>(
  configs: ServiceInfrastructureConfigs,
  serviceInfrastructureConfigType: ServiceInfrastructureConfigType
): T[] => {
  return configs.filter(
    (c) => c.serviceInfrastructureConfigType === serviceInfrastructureConfigType
  ) as T[];
};

const getServiceInfrastructureDefinition = <
  T extends ServiceInfrastructureConfig
>(
  configs: ServiceInfrastructureConfigs,
  serviceInfrastructureConfigType: ServiceInfrastructureConfigType
): T | undefined => {
  return getServiceInfrastructureDefinitions(
    configs,
    serviceInfrastructureConfigType
  )[0] as T;
};

export default {
  getServiceInfrastructureDefinitions,
  getServiceInfrastructureDefinition,
};
