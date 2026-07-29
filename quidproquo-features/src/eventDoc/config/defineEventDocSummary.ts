import { defineKeyValueStore, defineStorageDrive, kvsKey, QPQConfig } from 'quidproquo-core';

import { eventDocEventsStoreName, eventDocLegacyEventsStoreName } from '../constants/eventDocEventsStoreName';
import { eventDocStorageDriveName } from '../constants/eventDocStorageDriveName';
import { EventDocSummary } from '../models';
import { EventDocStoredEvent } from '../types/EventDocStoredEvent';

// Model store + append-only event store + blob bucket for a collection. Event store has
// no GSI deliberately: the local dev-server query processor can't target one, so all
// event reads go through the main table. The blob bucket holds the collection's
// immutable assets (and later its derived runtime artifacts) under per-doc prefixes.
export const defineEventDocSummary = (keyValueStoreName: string): QPQConfig => [
  defineKeyValueStore<EventDocSummary>(keyValueStoreName, 'type', ['id'], {
    indexes: [{ partitionKey: 'type', sortKey: 'updatedAt' }],
    disablePointInTimeRecovery: false,
  }),
  // The live log: pk=modelId, sk=sortable event id (string).
  defineKeyValueStore<EventDocStoredEvent>(eventDocEventsStoreName(keyValueStoreName), 'pk', [kvsKey('sk', 'string')], {
    disablePointInTimeRecovery: false,
  }),

  // The legacy log, numeric sort key. Declared but unused: a DynamoDB key schema cannot be
  // altered in place, so the switch to sortable ids meant a new table. This keeps the old
  // one deployed and its data reachable until the migration copies it across.
  defineKeyValueStore<{ pk: string; sk: number; data: unknown }>(eventDocLegacyEventsStoreName(keyValueStoreName), 'pk', [kvsKey('sk', 'number')], {
    disablePointInTimeRecovery: false,
  }),
  defineStorageDrive(eventDocStorageDriveName(keyValueStoreName)),
];
