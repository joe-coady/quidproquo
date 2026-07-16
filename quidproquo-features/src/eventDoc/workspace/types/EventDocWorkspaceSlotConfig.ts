import { EventDocWorkspaceDocumentSlotConfig } from './EventDocWorkspaceDocumentSlotConfig';
import { EventDocWorkspaceLocalSlotConfig } from './EventDocWorkspaceLocalSlotConfig';

// `any` views deliberately: this union is the CONSTRAINT slot maps are checked
// against, and concrete view types would break assignability (reducer state params
// are contravariant). Per-slot view/api types are recovered by the
// EventDocWorkspaceSlotViewOf / EventDocWorkspaceSlotApiOf mapped types.
export type EventDocWorkspaceSlotConfig = EventDocWorkspaceDocumentSlotConfig<any, any> | EventDocWorkspaceLocalSlotConfig<any, any>;
