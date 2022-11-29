export enum ServiceInfrastructureConfigType {
  ROUTE = "ROUTE",
  DNS = "DNS",
  SERVICE_NAME = "SERVICE_NAME",
}

export interface ServiceInfrastructureConfig {
  serviceInfrastructureConfigType: ServiceInfrastructureConfigType;
}

export type ServiceInfrastructureConfigs = ServiceInfrastructureConfig[];
