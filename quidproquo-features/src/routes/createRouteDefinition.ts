import { AskResponse, HTTPMethod } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, RouteOptions } from 'quidproquo-webserver';

import { dynamicRoute, DynamicRouteHandler, DynamicRouteKnownErrors, ExtractRouteParams } from './dynamicRoute';

// A dynamicRoute with its RouteOptions already baked in. Callers only supply the
// method/path/version, so the options position drops off the settings tuple.
export type RouteDefinition = <S extends string>(
  settings: [HTTPMethod, S] | [HTTPMethod, S, number],
  runtime: (event: HTTPEvent, params: ExtractRouteParams<S>) => AskResponse<HTTPEventResponse>,
  knownErrors?: DynamicRouteKnownErrors,
) => DynamicRouteHandler<S>;

// Stamp out a route family that shares RouteOptions (auth settings, cors, etc.)
// and a common set of known-error mappings. Both are closured in; per-route
// knownErrors are merged on top of commonKnownErrors and win on conflict:
//
//   const usersRoute = createRouteDefinition(
//     { routeAuthSettings: { userDirectoryName: 'users' } },
//     { [SomeErrorEnum.NotAuthenticated]: 401 },
//   );
//   export const getMe = usersRoute(['GET', '/me'], function* (event) { ... });
export const createRouteDefinition = (options: RouteOptions = {}, commonKnownErrors: DynamicRouteKnownErrors = {}): RouteDefinition => {
  return <S extends string>(
    settings: [HTTPMethod, S] | [HTTPMethod, S, number],
    runtime: (event: HTTPEvent, params: ExtractRouteParams<S>) => AskResponse<HTTPEventResponse>,
    knownErrors?: DynamicRouteKnownErrors,
  ): DynamicRouteHandler<S> => {
    const [method, path, version] = settings;

    return dynamicRoute<S>([method, path, version ?? 1, options], runtime, { ...commonKnownErrors, ...knownErrors });
  };
};
