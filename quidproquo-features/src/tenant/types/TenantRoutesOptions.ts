import { CrossModuleOwner } from 'quidproquo-core';
import { RouteAuthSettings } from 'quidproquo-webserver';

export type TenantRoutesOptions = {
  basePath: `/${string}`;
  // Tenant routes are meaningless unauthenticated - membership keys off the user.
  routeAuthSettings: RouteAuthSettings;
  version?: number;
  // Header the client sends its selected tenant id on. Defaults to x-qpq-tenant-id.
  tenantHeaderName?: string;
};

export type TenantOptions = TenantRoutesOptions & {
  // The service that owns the tenant registry. The stores, publish sync and
  // management routes only materialise on that service's deploy; every other
  // service gets just the scope resolver + a cross-module ref to the membership
  // table. Declare defineTenant identically in every service, passing the same
  // owner, and let the deploy decide what materialises. `module` is required -
  // it names the owning service the registry is gated to.
  owner: CrossModuleOwner & { module: string };
};
