import {
  ServiceInfrastructureConfigType,
  ServiceInfrastructureConfig,
  ServiceInfrastructureConfigs,
} from "./serviceInfrastructureDefinitions/ServiceInfrastructureConfig";

import { RouteInfrastructureConfig } from "./serviceInfrastructureDefinitions/route";
import { ServiceNameInfrastructureConfig } from "./serviceInfrastructureDefinitions/serviceName";

import { SrcPathname } from "./types/srcFileTypes";

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

export const getAllSrcEntries = (
  configs: ServiceInfrastructureConfigs
): SrcPathname[] => {
  const routes = getServiceInfrastructureDefinitions<RouteInfrastructureConfig>(
    configs,
    ServiceInfrastructureConfigType.ROUTE
  );
  return routes.map((r) => r.src);
};

export const getServiceName = (
  configs: ServiceInfrastructureConfigs
): string => {
  const serviceName =
    getServiceInfrastructureDefinition<ServiceNameInfrastructureConfig>(
      configs,
      ServiceInfrastructureConfigType.SERVICE_NAME
    )?.serviceName;

  if (!serviceName) {
    throw new Error("please use defineServiceName in your QPQ config");
  }

  return serviceName;
};

export default {
  getServiceInfrastructureDefinitions,
  getServiceInfrastructureDefinition,
  getAllSrcEntries,
  getServiceName,
};
