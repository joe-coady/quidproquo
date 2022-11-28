export enum ServiceInfrastructureConfigType {
  ROUTE = "ROUTE",
  DNS = "DNS",
}

export interface ServiceInfrastructureConfig {
  serviceInfrastructureConfigType: ServiceInfrastructureConfigType;
}

export type ServiceInfrastructureConfigs = ServiceInfrastructureConfig[];
