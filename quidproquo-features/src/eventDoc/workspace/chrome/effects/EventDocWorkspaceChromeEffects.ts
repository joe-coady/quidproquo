import { EventDocWorkspaceChromeSetHelpOpenEffect } from './EventDocWorkspaceChromeSetHelpOpenEffect';
import { EventDocWorkspaceChromeSetHistoryOpenEffect } from './EventDocWorkspaceChromeSetHistoryOpenEffect';
import { EventDocWorkspaceChromeSetHistorySlotKeyEffect } from './EventDocWorkspaceChromeSetHistorySlotKeyEffect';

export type EventDocWorkspaceChromeEffects =
  EventDocWorkspaceChromeSetHistoryOpenEffect | EventDocWorkspaceChromeSetHelpOpenEffect | EventDocWorkspaceChromeSetHistorySlotKeyEffect;
