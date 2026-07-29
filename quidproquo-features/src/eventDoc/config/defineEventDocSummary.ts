import { defineKeyValueStore, defineStorageDrive, kvsKey, QPQConfig } from 'quidproquo-core';

import { getFeatureEntryQpqFunctionRuntime } from '../../getFeatureEntryQpqFunctionRuntime';
import { eventDocEventsStoreName, eventDocLegacyEventsStoreName } from '../constants/eventDocEventsStoreName';
import { EVENT_DOC_STORE_NAME_GLOBAL } from '../constants/eventDocGlobalNames';
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
  //
  // Its change stream drives the summary projector. That is what makes the summary a pure
  // projection: the append writes the event and stops, and the record is rebuilt from the
  // log out of band. Coalescing collapses a batch to one rebuild per document, so a burst of
  // appends to one document costs one re-derivation rather than one per event.
  defineKeyValueStore<EventDocStoredEvent>(eventDocEventsStoreName(keyValueStoreName), 'pk', [kvsKey('sk', 'string')], {
    disablePointInTimeRecovery: false,
    onStream: {
      runtime: {
        ...getFeatureEntryQpqFunctionRuntime('eventDoc', 'kvsStream', 'eventDocSummaryProjector::projectEventDocSummary'),
        // The projector resolves the rest of the store (events table, blob bucket) from this
        // by the same naming convention, and reads the collection `type` off each row, since
        // one events table can host several collections.
        globals: { [EVENT_DOC_STORE_NAME_GLOBAL]: keyValueStoreName },
      },
      coalesceByPartitionKey: true,
    },
  }),

  // The legacy log, numeric sort key. Declared but unused: a DynamoDB key schema cannot be
  // altered in place, so the switch to sortable ids meant a new table. This keeps the old
  // one deployed and its data reachable until the migration copies it across.
  defineKeyValueStore<{ pk: string; sk: number; data: unknown }>(eventDocLegacyEventsStoreName(keyValueStoreName), 'pk', [kvsKey('sk', 'number')], {
    disablePointInTimeRecovery: false,
  }),
  defineStorageDrive(eventDocStorageDriveName(keyValueStoreName)),
];
