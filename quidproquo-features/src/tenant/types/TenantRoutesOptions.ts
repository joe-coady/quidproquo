import { RouteAuthSettings } from 'quidproquo-webserver';

export type TenantRoutesOptions = {
  basePath: `/${string}`;
  // Tenant routes are meaningless unauthenticated - membership keys off the user.
  routeAuthSettings: RouteAuthSettings;
  version?: number;
  // Header the client sends its selected tenant id on. Defaults to x-qpq-tenant-id.
  tenantHeaderName?: string;
};
