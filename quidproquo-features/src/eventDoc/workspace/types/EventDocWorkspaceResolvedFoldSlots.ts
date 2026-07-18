import { EventDocWorkspaceChromeSlotFold } from '../chrome/eventDocWorkspaceChromeSlotFold';
import { EventDocWorkspaceSlotFoldsConfig } from './EventDocWorkspaceSlotFoldsConfig';

// Fold-slot maps get the default chrome fold slot unless they define their own —
// the fold-level mirror of EventDocWorkspaceResolvedSlots.
export type EventDocWorkspaceResolvedFoldSlots<TSlots extends EventDocWorkspaceSlotFoldsConfig> = 'chrome' extends keyof TSlots
  ? TSlots
  : TSlots & { chrome: EventDocWorkspaceChromeSlotFold };
