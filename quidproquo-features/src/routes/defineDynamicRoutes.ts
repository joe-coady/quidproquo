import { QPQConfig } from 'quidproquo-core';

import { defineVersionedRoute } from './defineVersionedRoute';
import { DynamicRouteHandler } from './dynamicRoute';

export const defineDynamicRoutes = (controllerRuntime: Record<string, DynamicRouteHandler>, path: `/${string}` = '/entry/controller'): QPQConfig =>
  Object.keys(controllerRuntime).map((key) => {
    const route = controllerRuntime[key].dynamicRoute;
    if (!route) {
      throw new Error(`Route not defined for ${key}`);
    }

    return defineVersionedRoute(route.method, route.path, `${path}::${key}`, route.options, route.version);
  });
