import { EventDocWorkspaceAppendHistoryEventEffect } from './EventDocWorkspaceAppendHistoryEventEffect';
import { EventDocWorkspaceAppendHistoryEventsEffect } from './EventDocWorkspaceAppendHistoryEventsEffect';
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
  | EventDocWorkspaceAppendHistoryEventsEffect
  | EventDocWorkspaceSetPendingEventsEffect
  | EventDocWorkspaceRemovePendingEventEffect
  | EventDocWorkspaceSetDocumentIdentityEffect
  | EventDocWorkspaceSetLoadingEffect
  | EventDocWorkspaceSetSavingEffect
  | EventDocWorkspaceSetErrorEffect
  | EventDocWorkspaceResetEffect;
