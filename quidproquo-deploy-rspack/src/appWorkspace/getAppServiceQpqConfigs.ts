// Loads every service's QPQ config for an app by `require`ing each
// apps/<app>/services/<svc>/service/src/infrastructure.ts directly (its @scope
// imports resolve to built lib dist via workspace symlinks). This makes the
// caller the single source of truth for configs: no synth-to-JSON round-trip.
// Relies on TS require hooks (ts-node / rspack config eval), as go:dev:api has.
import { Nullable, QPQConfig } from 'quidproquo-core';

import path from 'path';

import { getAppServiceNames } from './getAppServiceNames';
import { requireQpqConfig } from './requireQpqConfig';

const loadServiceConfig = (root: string, appName: string, service: string): Nullable<QPQConfig> => {
  const infra = path.join(root, 'apps', appName, 'services', service, 'service', 'src', 'infrastructure');
  try {
    return requireQpqConfig(infra);
  } catch (e) {
    console.warn(`[dev-server] failed to load infrastructure for '${service}':`, e);
    return null;
  }
};

export const getAppServiceQpqConfigs = (root: string, appName: string): QPQConfig[] => {
  return getAppServiceNames(root, appName)
    .map((service) => loadServiceConfig(root, appName, service))
    .filter((c): c is QPQConfig => c !== null);
};
