import { buildEffectReducer } from 'quidproquo-core';

import { EventDocListEffect } from './effects/EventDocListEffect';
import type { EventDocListEffects } from './effects/EventDocListEffects';
import { addItem } from './stateUpdaters/addItem';
import { setConfig } from './stateUpdaters/setConfig';
import { setError } from './stateUpdaters/setError';
import { setItems } from './stateUpdaters/setItems';
import { setLoading } from './stateUpdaters/setLoading';
import { setPage } from './stateUpdaters/setPage';
import { setPageSize } from './stateUpdaters/setPageSize';
import type { EventDocListState } from './types/EventDocListState';

export const eventDocListReducer = buildEffectReducer<EventDocListState, EventDocListEffects>({
  [EventDocListEffect.SetConfig]: setConfig,
  [EventDocListEffect.SetItems]: setItems,
  [EventDocListEffect.AddItem]: addItem,
  [EventDocListEffect.SetLoading]: setLoading,
  [EventDocListEffect.SetError]: setError,
  [EventDocListEffect.SetPage]: setPage,
  [EventDocListEffect.SetPageSize]: setPageSize,
});
