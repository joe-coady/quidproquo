import { EventDocCreateDraftEffect } from './EventDocCreateDraftEffect';
import { EventDocInitStateEffect } from './EventDocInitStateEffect';
import { EventDocPublishEffect } from './EventDocPublishEffect';
import { EventDocSetCodeEffect } from './EventDocSetCodeEffect';
import { EventDocSetNameEffect } from './EventDocSetNameEffect';

// Every reserved (non-domain) event-doc effect in plain-payload form (what action
// creators pass to askApplyEventDocEvent). The fold side derives its stored shapes
// from this union via EventDocFoldEffects (see fold/ReservedEventDocEffects).
export type EventDocEffects =
  EventDocInitStateEffect | EventDocSetCodeEffect | EventDocSetNameEffect | EventDocCreateDraftEffect | EventDocPublishEffect;
