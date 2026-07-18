import { EventDocMigrations } from '../../fold';
import { EventDocDocument } from '../../models';
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
  };
