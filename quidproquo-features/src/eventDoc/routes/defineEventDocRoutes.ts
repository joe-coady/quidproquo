import { HTTPMethod, QPQConfig, QpqFunctionRuntimeAdvanced } from 'quidproquo-core';
import { RouteOptions } from 'quidproquo-webserver';

import { defineVersionedRoute } from '../../routes/defineVersionedRoute';
import { EVENT_DOC_USER_DIRECTORY_GLOBAL } from '../constants/eventDocGlobalNames';
import { buildEventDocStore } from '../context/buildEventDocStore';
import { buildEventDocStoreGlobals } from '../globals/buildEventDocStoreGlobals';
import { EventDocRoutesOptions } from '../types/EventDocRoutesOptions';

// Controllers ship inside this package (resolved relative to this file) and read
// store/type/userDirectory from per-route globals, so a service needs no
// controller wiring — drop the result into its infrastructure default export.
export const defineEventDocRoutes = ({
  storeName,
  type,
  basePath,
  routeAuthSettings,
  version,
  eventValidator,
  eventRenderer,
  onPublish,
  scopeResolver,
}: EventDocRoutesOptions): QPQConfig => {
  // Same assembly a hand-written route uses via askEventDocProvideStore, so built-in and
  // custom routes describe the identical store.
  const store = buildEventDocStore({
    storeName,
    type,
    eventValidator,
    eventRenderer,
    onPublish,
    scopeResolver,
  });

  const globals: Record<string, unknown> = buildEventDocStoreGlobals(store);

  if (routeAuthSettings?.userDirectoryName) {
    globals[EVENT_DOC_USER_DIRECTORY_GLOBAL] = routeAuthSettings.userDirectoryName;
  }

  const options: RouteOptions = routeAuthSettings ? { routeAuthSettings } : {};

  const runtime = (functionName: string): QpqFunctionRuntimeAdvanced => ({
    basePath: __dirname,
    relativePath: `./controllers/${functionName}`,
    functionName,
    globals,
  });

  const route = (method: HTTPMethod, path: string, functionName: string): QPQConfig =>
    defineVersionedRoute(method, path, runtime(functionName), options, version);

  return [
    route('GET', basePath, 'list'),
    route('GET', `${basePath}/{id}`, 'get'),
    route('GET', `${basePath}/{id}/events`, 'listEvents'),
    route('GET', `${basePath}/{id}/render`, 'render'),
    route('POST', basePath, 'create'),
    route('POST', `${basePath}/{id}/events`, 'appendEvent'),
    route('POST', `${basePath}/{id}/assets`, 'createAsset'),
    route('GET', `${basePath}/{id}/assets/{assetId}`, 'getAsset'),
    route('DELETE', `${basePath}/{id}`, 'remove'),
  ];
};
