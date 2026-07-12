import { type QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { getWorkspaceServiceQpqConfig } from 'quidproquo-deploy-awscdk';

import { getRoot, getServiceNames } from './discovery';

// Loads a service's live infrastructure.ts (qpq runs with ts-node hooks
// registered, so requiring TS works and `@scope/*` imports resolve through
// workspace symlinks).
export const loadServiceQpqConfig = (appName: string, service: string): QPQConfig => getWorkspaceServiceQpqConfig(getRoot(), appName, service);

export const getAppPrefix = (appName: string): string => {
  const services = getServiceNames(appName);
  if (services.length === 0) throw new Error(`No services found for app ${appName}`);
  return qpqCoreUtils.getApplicationName(loadServiceQpqConfig(appName, services[0]));
};
