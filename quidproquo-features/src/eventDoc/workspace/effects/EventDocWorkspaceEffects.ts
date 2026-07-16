import { EventDocWorkspaceAppendHistoryEventEffect } from './EventDocWorkspaceAppendHistoryEventEffect';
import { EventDocWorkspaceApplyEventEffect } from './EventDocWorkspaceApplyEventEffect';
import { EventDocWorkspaceRemovePendingEventEffect } from './EventDocWorkspaceRemovePendingEventEffect';
import { EventDocWorkspaceResetEffect } from './EventDocWorkspaceResetEffect';
import { EventDocWorkspaceSetDocumentIdentityEffect } from './EventDocWorkspaceSetDocumentIdentityEffect';
import { EventDocWorkspaceSetErrorEffect } from './EventDocWorkspaceSetErrorEffect';
import { EventDocWorkspaceSetHistoryEventsEffect } from './EventDocWorkspaceSetHistoryEventsEffect';
import { EventDocWorkspaceSetLoadingEffect } from './EventDocWorkspaceSetLoadingEffect';
import { EventDocWorkspaceSetPendingEventsEffect } from './EventDocWorkspaceSetPendingEventsEffect';
import { EventDocWorkspaceSetSavingEffect } from './EventDocWorkspaceSetSavingEffect';

export type EventDocWorkspaceEffects =
  | EventDocWorkspaceApplyEventEffect
  | EventDocWorkspaceSetHistoryEventsEffect
  | EventDocWorkspaceAppendHistoryEventEffect
  | EventDocWorkspaceSetPendingEventsEffect
  | EventDocWorkspaceRemovePendingEventEffect
  | EventDocWorkspaceSetDocumentIdentityEffect
  | EventDocWorkspaceSetLoadingEffect
  | EventDocWorkspaceSetSavingEffect
  | EventDocWorkspaceSetErrorEffect
  | EventDocWorkspaceResetEffect;
