import { defineKeyValueStore, defineStorageDrive, kvsKey, QPQConfig } from 'quidproquo-core';

import { eventDocEventsStoreName } from '../constants/eventDocEventsStoreName';
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
  defineKeyValueStore<EventDocStoredEvent>(
    eventDocEventsStoreName(keyValueStoreName),
    'pk',
    [kvsKey('sk', 'number')],
    { disablePointInTimeRecovery: false }
  ),
  defineStorageDrive(eventDocStorageDriveName(keyValueStoreName)),
];
