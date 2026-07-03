import { buildEffectReducer, QpqReducer } from 'quidproquo-core';

import { EventDocDocument, EventDocEffect } from '../models';
import { createDraft } from './stateUpdaters/createDraft';
import { initState } from './stateUpdaters/initState';
import { publish } from './stateUpdaters/publish';
import { setCode } from './stateUpdaters/setCode';
import { setName } from './stateUpdaters/setName';
import { ReservedEventDocEffects } from './ReservedEventDocEffects';

// Reserved base effects every fold reducer carries, independent of any module's domain.
// Each handler is a pure state updater in ./stateUpdaters (one per effect).
export const buildEventDocBaseReducer = <TState extends EventDocDocument>(
  getInitialState: () => TState
): QpqReducer<TState, ReservedEventDocEffects> =>
  buildEffectReducer<TState, ReservedEventDocEffects>({
    [EventDocEffect.InitState]: initState(getInitialState),
    [EventDocEffect.SetCode]: setCode,
    [EventDocEffect.SetName]: setName,
    [EventDocEffect.CreateDraft]: createDraft,
    [EventDocEffect.Publish]: publish,
  });
