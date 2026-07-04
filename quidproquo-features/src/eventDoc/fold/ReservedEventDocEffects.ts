import { CreateDraftEffect } from './CreateDraftEffect';
import { InitStateEffect } from './InitStateEffect';
import { PublishEffect } from './PublishEffect';
import { SetCodeEffect } from './SetCodeEffect';
import { SetNameEffect } from './SetNameEffect';

// Every reserved (non-domain) effect the base reducer folds, for all documents.
export type ReservedEventDocEffects = InitStateEffect | SetCodeEffect | SetNameEffect | CreateDraftEffect | PublishEffect;
