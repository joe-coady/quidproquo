import { EventDocEffects } from '../effects/EventDocEffects';
import { EventDocFoldEffects } from './EventDocFoldEffects';

// Every reserved (non-domain) effect the base reducer folds, for all documents: the
// plain-payload union from ../effects mapped to the stored shape (each effect's data
// wrapped in EventDocEventPayload).
export type ReservedEventDocEffects = EventDocFoldEffects<EventDocEffects>;
