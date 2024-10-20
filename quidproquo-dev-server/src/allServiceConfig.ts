import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';
import { DevServerConfig } from './types';

// Create an async function to fetch all services
export function getAllServiceConfigs(devServerConfig: DevServerConfig): QPQConfig[] {
  // Clone it
  const allServices = JSON.parse(JSON.stringify(devServerConfig.qpqConfigs));

  // Iterate over each enum value and dynamically import the corresponding infrastructure
  const rootDomain = `${devServerConfig.serverDomain}:${devServerConfig.serverPort}`;

  // TODO: Make this pure
  // Overload the domain settings to represent the local env
  // This is kind of gross, mutating it, but this is just dev.
  for (const qpqConfig of allServices) {
    // Make it a production build
    // const appSettings = qpqCoreUtils.getApplicationModuleSetting(qpqConfig);
    // appSettings.feature = undefined;
    // appSettings.environment = 'production';

    const baseDomain = qpqWebServerUtils.getDomainRoot(
      rootDomain,
      qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
      qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
    );

    // Change the domain
    const dnsConfigs = qpqWebServerUtils.getDnsConfigs(qpqConfig);
    for (const dnsConfig of dnsConfigs) {
      dnsConfig.dnsBase = rootDomain;
    }

    // Expose global cors headers
    const defaultRouteSettings = qpqWebServerUtils.getDefaultRouteSettings(qpqConfig);
    for (const getDefaultRouteSetting of defaultRouteSettings) {
      getDefaultRouteSetting.routeOptions.allowedOrigins = [
        ...(getDefaultRouteSetting.routeOptions.allowedOrigins || []),
        `http://${baseDomain}`,
        '*',
      ];
    }

    // Expose global cors headers
    const routes = qpqWebServerUtils.getAllRoutes(qpqConfig);
    for (const route of routes) {
      route.options.allowedOrigins = [...(route.options.allowedOrigins || []), `http://${baseDomain}`, '*'];
    }
  }

  return allServices;
}
