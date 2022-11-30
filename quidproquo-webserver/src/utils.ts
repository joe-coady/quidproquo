import {
  ServiceInfrastructureConfigType,
  ServiceInfrastructureConfig,
  ServiceInfrastructureConfigs,
} from "./serviceInfrastructureDefinitions/ServiceInfrastructureConfig";

import { RouteInfrastructureConfig } from "./serviceInfrastructureDefinitions/route";

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

export default {
  getServiceInfrastructureDefinitions,
  getServiceInfrastructureDefinition,
  getAllSrcEntries,
};
