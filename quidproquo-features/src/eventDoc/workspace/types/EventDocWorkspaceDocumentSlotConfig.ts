import { EventDocMigrations } from '../../fold';
import { EventDocDocument } from '../../models';
import { CoalesceEventType } from './CoalesceEventType';
import { EventDocWorkspaceSlotConfigBase } from './EventDocWorkspaceSlotConfigBase';
import { EventDocWorkspaceSlotKind } from './EventDocWorkspaceSlotKind';
import { EventDocWorkspaceStoryApi } from './EventDocWorkspaceStoryApi';

export type EventDocWorkspaceDocumentSlotConfig<
  TView extends EventDocDocument = EventDocDocument,
  TApi extends EventDocWorkspaceStoryApi = EventDocWorkspaceStoryApi,
> = EventDocWorkspaceSlotConfigBase<TView, TApi> & {
  kind: EventDocWorkspaceSlotKind.document;
  migrations?: EventDocMigrations;
  // Merged AFTER the reserved rules (SET_CODE/SET_NAME coalesce; lifecycle events
  // never do). Unlisted types append.
  coalesceEventTypes?: CoalesceEventType[];
};
