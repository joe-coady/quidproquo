import { QPQConfig } from 'quidproquo-core';

import { defineEventDocRoutes } from '../routes/defineEventDocRoutes';
import { EventDocRoutesOptions } from '../types/EventDocRoutesOptions';
import { defineEventDocSummary } from './defineEventDocSummary';

// Store + routes in one call, for the one-store-one-type case. For multiple
// types in one store, call defineEventDocSummary once and
// defineEventDocRoutes per type so the store isn't defined twice.
export const defineEventDoc = (options: EventDocRoutesOptions): QPQConfig => [
  defineEventDocSummary(options.storeName),
  defineEventDocRoutes(options),
];
