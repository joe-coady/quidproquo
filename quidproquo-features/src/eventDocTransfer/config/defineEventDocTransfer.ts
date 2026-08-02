import { defineStorageDrive, HTTPMethod, QPQConfig, QpqFunctionRuntimeAdvanced } from 'quidproquo-core';
import { RouteAuthSettings, RouteOptions } from 'quidproquo-webserver';

import { EVENT_DOC_USER_DIRECTORY_GLOBAL } from '../../eventDoc/constants/eventDocGlobalNames';
import { defineVersionedRoute } from '../../routes/defineVersionedRoute';
import { EVENT_DOC_TRANSFER_DRIVE_NAME } from '../constants';
import { buildEventDocTransferGlobals } from '../globals';
import { EventDocTransferCollectionSource, toEventDocTransferCollection } from './toEventDocTransferCollection';

export type EventDocTransferOptions = {
  /**
   * The service name EventDocLinks use to address this service's collections
   * (`link.eventDocService`). Transfers never leave it: the stores live here, so a reference into
   * another service throws rather than being silently dropped from a manifest.
   */
  service: string;
  /**
   * The collections a transfer may read and write. Feed this the SAME array the service maps into
   * its `defineEventDoc` calls (each entry's `functions` object carries the identity), so the two
   * cannot drift. Live functions objects work directly too, and a collection that needs the import
   * hooks (onPublish/onAppend) passes a bare `{ storeName, type, onPublish?, onAppend? }` entry.
   */
  collections: EventDocTransferCollectionSource[];
  /**
   * Establishes the ambient storage scope for the whole request, exactly like a collection's own
   * `scopeResolver`. Needed separately because a transfer spans collections, so there is no single
   * store to read the resolver name from. Omit only if none of the collections partition.
   */
  scopeResolver?: string;
  /**
   * Import writes unvalidated history and export reads across every registered collection, so gate
   * these harder than the collections' own routes.
   */
  routeAuthSettings?: RouteAuthSettings;
  version?: number;
};

// Its own base path at the api root, never below a collection's: `{id}` matches any single segment,
// so a literal under a collection root would be ambiguous with a doc id. Sits alongside the
// collection roots (/templates, /content, ...), so nothing may declare a collection at /transfer.
const TRANSFER_BASE_PATH = '/transfer';

/**
 * The export/import surface for one service: a staging drive plus five routes. Controllers ship
 * inside this package and read the collection registry from per-route globals, so a service needs
 * no controller wiring - drop the result into its infrastructure default export next to its
 * `defineEventDoc` calls.
 */
export const defineEventDocTransfer = ({ service, collections, scopeResolver, routeAuthSettings, version }: EventDocTransferOptions): QPQConfig => {
  const globals: Record<string, unknown> = buildEventDocTransferGlobals({
    service,
    collections: collections.map(toEventDocTransferCollection),
    scopeResolver,
  });

  // Same contract every eventDoc-context definer has (defineEventDocRoutes, defineTenantRoutes,
  // defineEventDocAi): anything reaching askEventDocResolveUserId/Actor - which the tenant scope
  // resolver does on EVERY request - reads the directory name off this global and throws
  // "Global config eventDocUserDirectory not found" without it.
  if (routeAuthSettings?.userDirectoryName) {
    globals[EVENT_DOC_USER_DIRECTORY_GLOBAL] = routeAuthSettings.userDirectoryName;
  }

  const options: RouteOptions = routeAuthSettings ? { routeAuthSettings } : {};

  const runtime = (functionName: string): QpqFunctionRuntimeAdvanced => ({
    basePath: __dirname,
    relativePath: `../routes/controllers/${functionName}`,
    functionName,
    globals,
  });

  const route = (method: HTTPMethod, path: string, functionName: string): QPQConfig =>
    defineVersionedRoute(method, path, runtime(functionName), options, version);

  return [
    defineStorageDrive(EVENT_DOC_TRANSFER_DRIVE_NAME),

    route('POST', `${TRANSFER_BASE_PATH}/manifest`, 'manifest'),
    route('POST', `${TRANSFER_BASE_PATH}/export`, 'exportBundle'),
    route('POST', `${TRANSFER_BASE_PATH}/upload`, 'upload'),
    route('POST', `${TRANSFER_BASE_PATH}/plan`, 'plan'),
    route('POST', `${TRANSFER_BASE_PATH}/import`, 'importBundle'),
  ];
};
