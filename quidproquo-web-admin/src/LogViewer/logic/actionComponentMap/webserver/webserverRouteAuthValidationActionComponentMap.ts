import { RouteAuthValidationActionType } from 'quidproquo-webserver';

const webserverRouteAuthValidationActionComponentMap: Record<string, string[]> = {
  [RouteAuthValidationActionType.Decode]: ['askRouteAuthValidationDecode', 'event', 'routeAuthSettings', 'ignoreExpiration'],
};

export default webserverRouteAuthValidationActionComponentMap;
