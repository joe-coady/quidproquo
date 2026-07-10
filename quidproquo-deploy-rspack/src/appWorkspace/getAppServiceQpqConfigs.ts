// Loads every service's QPQ config for an app by `require`ing each
// apps/<app>/services/<svc>/service/src/infrastructure.ts directly (its @scope
// imports resolve to built lib dist via workspace symlinks). This makes the
// caller the single source of truth for configs: no synth-to-JSON round-trip.
// Relies on TS require hooks (ts-node / rspack config eval), as go:dev has.
import { QPQConfig } from 'quidproquo-core';

import fs from 'fs';
import path from 'path';

const loadServiceConfig = (root: string, appName: string, service: string): QPQConfig | null => {
  const infra = path.join(root, 'apps', appName, 'services', service, 'service', 'src', 'infrastructure');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const infraModule = require(infra);
    return infraModule.default || infraModule;
  } catch (e) {
    console.warn(`[dev-server] failed to load infrastructure for '${service}':`, e);
    return null;
  }
};

export const getAppServiceNames = (root: string, appName: string): string[] => {
  const dir = path.join(root, 'apps', appName, 'services');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((s) => ['infrastructure.ts', 'infrastructure.js'].some((infra) => fs.existsSync(path.join(dir, s, 'service', 'src', infra))));
};

// First app under apps/ that has a services/ dir — the app-agnostic default.
export const getDefaultAppName = (root: string): string | undefined => {
  const appsDir = path.join(root, 'apps');
  if (!fs.existsSync(appsDir)) return undefined;
  return fs.readdirSync(appsDir).find((a) => fs.existsSync(path.join(appsDir, a, 'services')));
};

export const getAppServiceQpqConfigs = (root: string, appName: string): QPQConfig[] => {
  return getAppServiceNames(root, appName)
    .map((service) => loadServiceConfig(root, appName, service))
    .filter((c): c is QPQConfig => c !== null);
};
