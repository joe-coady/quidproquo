import { defineDynamicFunctions, QPQConfig, QpqFunctionRuntime } from 'quidproquo-core';

import { eventDocFunctionsName } from '../constants/eventDocFunctionsName';
import { getEventDocFunctionsIdentity } from '../definition/getEventDocFunctionsIdentity';
import { EventDocFunctions } from '../definition/types/EventDocFunctions';
import { defineEventDocRoutes } from '../routes/defineEventDocRoutes';
import { EventDocCollectionOptions } from '../types/EventDocCollectionOptions';
import { defineEventDocSummary } from './defineEventDocSummary';

// Store + routes in one call, for the one-store-one-type case. For multiple types in one
// store, call defineEventDocSummary once and defineEventDocRoutes per type so the store
// isn't defined twice — passing it the snapshotFunctions map for every type it hosts.
//
// Takes the collection's live EventDocFunctions object (the doc type's definition, or
// extendEventDocFunctions(definition, { render })) together with the runtime path that
// resolves to that SAME export at request time — the dynamicRoutes pattern: identity
// (storeName/type) is read off the object here at config time, behaviour is loaded from
// the path by the processors. The registration this emits is what the render/references
// routes and the snapshot projector address via eventDocFunctionsName(storeName, type).
//
// A collection with no definition (no render, no references, no snapshots) composes the
// low-level pair directly: defineEventDocSummary + defineEventDocRoutes.
export const defineEventDoc = (functions: EventDocFunctions, runtime: QpqFunctionRuntime, options: EventDocCollectionOptions): QPQConfig => {
  const { storeName, type } = getEventDocFunctionsIdentity(functions);

  const functionsName = eventDocFunctionsName(storeName, type);

  return [
    defineDynamicFunctions(functionsName, runtime),
    defineEventDocSummary(storeName, { snapshotFunctions: { [type]: functionsName } }),
    defineEventDocRoutes({ storeName, type, ...options }),
  ];
};
