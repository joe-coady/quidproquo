import { getDevServerOptions } from 'quidproquo-dev-server';

import fs from 'fs';
import path from 'path';

// Filesystem discovery for views microfrontends — no central config. Everything
// (aliases, MF names, remotes, ports) is derived from the
// apps/<app>/services/<svc>/views convention and each service's QPQ config.

export type ViewsInfo = {
  service: string;
  appName: string;
  viewsDir: string;
  // The import alias / package name, e.g. @<app>/design-service-views
  alias: string;
  // MF container names must be identifier-safe, e.g. <app>_design_service_views
  mfName: string;
  port: number;
};

export type ViewsContext = {
  root: string;
  appName: string;
  self: ViewsInfo;
  siblings: ViewsInfo[]; // every OTHER views project in the app
};

export const sanitizeMfName = (alias: string): string => alias.replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '_');

// Local dev-server port: the service's `defineDevServerOptions({ port })`,
// falling back to a legacy `"port"` in the views package.json, then 4200.
// Requiring the TS infrastructure module relies on the caller running with TS
// require hooks (rspack.config.ts evaluation / ts-node), as the views build
// already does.
const resolveViewsPort = (viewsDir: string, pkg: { port?: number | string }): number => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const infraModule = require(path.join(viewsDir, '..', 'service', 'src', 'infrastructure'));
    const port = getDevServerOptions(infraModule.default || infraModule).port;
    if (port) {
      return port;
    }
  } catch {
    // fall through to the package.json port
  }

  return Number(pkg.port) || 4200;
};

const readViewsInfo = (root: string, appName: string, service: string): ViewsInfo | null => {
  const viewsDir = path.join(root, 'apps', appName, 'services', service, 'views');
  const pkgPath = path.join(viewsDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const alias = pkg.name || `@${appName}/${service}-service-views`;
  return {
    service,
    appName,
    viewsDir,
    alias,
    mfName: sanitizeMfName(alias),
    port: resolveViewsPort(viewsDir, pkg),
  };
};

// Resolve the views context from a views directory (apps/<app>/services/<svc>/views).
export const getViewsContext = (viewsDir: string): ViewsContext => {
  const parts = path.resolve(viewsDir).split(path.sep);
  const appsIdx = parts.lastIndexOf('apps');
  if (appsIdx < 0 || parts[appsIdx + 2] !== 'services' || parts[appsIdx + 4] !== 'views') {
    throw new Error(`Expected apps/<app>/services/<svc>/views, got ${viewsDir}`);
  }
  const root = parts.slice(0, appsIdx).join(path.sep);
  const appName = parts[appsIdx + 1];
  const service = parts[appsIdx + 3];

  const self = readViewsInfo(root, appName, service);
  if (!self) throw new Error(`No package.json for views project at ${viewsDir}`);

  const servicesDir = path.join(root, 'apps', appName, 'services');
  const siblings = fs
    .readdirSync(servicesDir)
    .filter((s) => s !== service)
    .map((s) => readViewsInfo(root, appName, s))
    .filter((v): v is ViewsInfo => v !== null);

  return { root, appName, self, siblings };
};

// All views projects for an app (used by prep + the dev orchestrator).
export const getAllViews = (root: string, appName: string): ViewsInfo[] => {
  const servicesDir = path.join(root, 'apps', appName, 'services');
  if (!fs.existsSync(servicesDir)) return [];
  return fs
    .readdirSync(servicesDir)
    .map((s) => readViewsInfo(root, appName, s))
    .filter((v): v is ViewsInfo => v !== null);
};
