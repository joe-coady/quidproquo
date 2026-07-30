import { EventDocMigrations } from '../../fold';
import { EventDocDocument } from '../../models';
import { EventDocEventValidators } from '../../validation/types/EventDocEventValidators';
import { CoalesceEventType } from './CoalesceEventType';
import { EventDocWorkspaceSlotFoldConfigBase } from './EventDocWorkspaceSlotFoldConfigBase';
import { EventDocWorkspaceSlotKind } from './EventDocWorkspaceSlotKind';

// A document slot's api-free fold config (see EventDocWorkspaceSlotFoldConfigBase).
export type EventDocWorkspaceDocumentSlotFoldConfig<TView extends EventDocDocument = EventDocDocument> =
  EventDocWorkspaceSlotFoldConfigBase<TView> & {
    kind: EventDocWorkspaceSlotKind.document;
    migrations?: EventDocMigrations;
    // Merged AFTER the reserved rules (SET_CODE/SET_NAME coalesce; lifecycle events
    // never do). Unlisted types append.
    coalesceEventTypes?: CoalesceEventType[];
    // The FULLY MERGED validator registry (reserved + the collection's own), as the
    // definition assembled it. The workspace folds history incrementally through its own
    // path rather than calling definition.fold, so it needs the same rules handed to it or
    // the editor's live view would apply events the saved fold rejects.
    validators?: EventDocEventValidators<TView>;
  };
