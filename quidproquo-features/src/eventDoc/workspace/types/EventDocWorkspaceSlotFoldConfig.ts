import { EventDocWorkspaceDocumentSlotFoldConfig } from './EventDocWorkspaceDocumentSlotFoldConfig';
import { EventDocWorkspaceLocalSlotFoldConfig } from './EventDocWorkspaceLocalSlotFoldConfig';

// `any` views deliberately, same as EventDocWorkspaceSlotConfig: this union is the
// CONSTRAINT fold-slot maps are checked against, and concrete view types would
// break assignability (reducer state params are contravariant).
export type EventDocWorkspaceSlotFoldConfig = EventDocWorkspaceDocumentSlotFoldConfig<any> | EventDocWorkspaceLocalSlotFoldConfig<any>;
