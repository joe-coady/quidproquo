import { QPQConfig } from 'quidproquo-core';

import { defineVersionedRoute } from './defineVersionedRoute';

export const defineDynamicRoutes = (controllerRuntime: any, path: `/${string}` = '/entry/controller'): QPQConfig =>
  Object.keys(controllerRuntime).map((key) => {
    const runtime = controllerRuntime[key];
    const route = runtime.dynamicRoute;
    if (!route) {
      throw new Error(`Route not defined for ${key}`);
    }

    return defineVersionedRoute(route.method, route.path, `${path}::${key}`, runtime.dynamicRoute.options, runtime.dynamicRoute.version);
  });
