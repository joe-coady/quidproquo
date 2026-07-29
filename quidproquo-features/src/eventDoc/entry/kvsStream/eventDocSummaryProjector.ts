import { askConfigGetGlobal, AskResponse, askStorageScopeProvide, KvsStreamEventResponse, KvsStreamRecord } from 'quidproquo-core';

import { eventDocEventsStoreName } from '../../constants/eventDocEventsStoreName';
import { EVENT_DOC_STORE_NAME_GLOBAL } from '../../constants/eventDocGlobalNames';
import { eventDocStorageDriveName } from '../../constants/eventDocStorageDriveName';
import { askEventDocStoreProvide } from '../../context/askEventDocStoreProvide';
import { askEventDocSummaryRederive } from '../../logic/askEventDocSummaryRederive';
import { EventDocStoredEvent } from '../../types/EventDocStoredEvent';

/**
 * Rebuild a document's summary from its log, driven by the event store's change stream.
 *
 * This is what lets the summary be a pure projection. The writer appends an event and stops;
 * nothing on the write path maintains a read model, so the record can be dropped and rebuilt
 * at any time, and a document can have as many views as you care to project.
 *
 * Invoked once per changed document per batch (the store declares
 * `coalesceByPartitionKey`), so a burst of appends to one document costs ONE rebuild rather
 * than one per event. Re-deriving from the log is idempotent, which is what makes a stream's
 * at-least-once delivery and its retries harmless.
 */
export function* projectEventDocSummary(record: KvsStreamRecord): AskResponse<KvsStreamEventResponse> {
  const storeName = yield* askConfigGetGlobal<string>(EVENT_DOC_STORE_NAME_GLOBAL);

  // Keys arrive raw and the scope arrives beside them, so the rebuild simply re-enters the
  // scope the append ran under. That matters more than it looks: reading or writing under the
  // wrong scope would project one tenant's document into another's partition.
  const scope = record.scope;
  const modelId = String(record.keys.pk);

  // Which collection this document belongs to. It comes off the row rather than from config
  // because one events table can host several collections, and the stream serves the table.
  // A REMOVE carries no new image, so fall back to what was there.
  const image = (record.newImage ?? record.oldImage) as EventDocStoredEvent | undefined;

  if (!image?.type) {
    // Nothing identifies the collection, so there is no summary to rebuild. Rather than
    // guess, skip: the alternative is writing a record under the wrong type.
    return;
  }

  const store = {
    storeName,
    eventsStoreName: eventDocEventsStoreName(storeName),
    storageDriveName: eventDocStorageDriveName(storeName),
    type: image.type,
  };

  const rebuild = askEventDocStoreProvide(store, askEventDocSummaryRederive(modelId));

  // Unscoped rows carry no scope to re-enter, and the ambient default is already "none", so
  // only a scoped row wraps the rebuild in a provider.
  if (scope === undefined) {
    yield* rebuild;

    return;
  }

  yield* askStorageScopeProvide(scope, rebuild);
}
