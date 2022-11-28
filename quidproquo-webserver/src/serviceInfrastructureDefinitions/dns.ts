import { DNSPath } from "../types/dnsTypes";

import {
  ServiceInfrastructureConfig,
  ServiceInfrastructureConfigType,
} from "./ServiceInfrastructureConfig";

export interface DnsServiceInfrastructureConfig
  extends ServiceInfrastructureConfig {
  dnsBase: DNSPath;
}

export const defineDns = (
  dnsBase: DNSPath
): DnsServiceInfrastructureConfig => ({
  serviceInfrastructureConfigType: ServiceInfrastructureConfigType.DNS,

  dnsBase,
});
