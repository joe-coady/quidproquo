import { QpqReducer } from 'quidproquo-core';

import { buildEventDocFoldReducer } from '../../eventDoc/fold/buildEventDocFoldReducer';
import { createEventDocInitialDocumentState } from '../../eventDoc/fold/createEventDocInitialDocumentState';
import { foldEventDocLog } from '../../eventDoc/fold/foldEventDocLog';
import { EventDocEvent } from '../../eventDoc/models';
import { TenantDocument } from '../models/TenantDocument';
import { setBrand } from './stateUpdaters/setBrand';
import { TenantEffect, TenantEffects } from './TenantEffect';

const seedTenantDocument = (): TenantDocument => ({
  ...createEventDocInitialDocumentState(1),
  brandColors: {},
});

const tenantFoldReducer = buildEventDocFoldReducer<TenantDocument, TenantEffects>(seedTenantDocument, {
  [TenantEffect.setBrand]: setBrand,
}) as QpqReducer<TenantDocument, EventDocEvent>;

// Fold a tenant's full event log into its current document (identity/lifecycle
// from the reserved base effects, branding from SET_BRAND). Version 1, no
// migrations yet.
export const foldTenantDocument = (events: EventDocEvent[]): TenantDocument =>
  foldEventDocLog(events, {
    seed: seedTenantDocument(),
    reducer: tenantFoldReducer,
    migrations: {},
    latestVersion: 1,
  });
