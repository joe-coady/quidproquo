export enum QPQWebServerConfigSettingType {
  Route = '@quidproquo-webserver/config/Route',
  DefaultRouteOptions = '@quidproquo-webserver/config/DefaultRouteOptions',
  Dns = '@quidproquo-webserver/config/Dns',
  OpenApi = '@quidproquo-webserver/config/OpenApi',
  Seo = '@quidproquo-webserver/config/Seo',
  SubdomainRedirect = '@quidproquo-webserver/config/SubdomainRedirect',
  WebEntry = '@quidproquo-webserver/config/WebEntry',
  Api = '@quidproquo-webserver/config/Api',
  ApiKey = '@quidproquo-webserver/config/ApiKey',
  ServiceFunction = '@quidproquo-webserver/config/ServiceFunction',
  WebSocket = '@quidproquo-webserver/config/WebSocket',
}

export interface CacheSettings {
  minTTLInSeconds: number;
  maxTTLInSeconds: number;
  defaultTTLInSeconds: number;
  mustRevalidate: boolean;
}
