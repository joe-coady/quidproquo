import { Effect } from 'quidproquo-core';

import { EventDocEventPayload } from '../models/EventDocEventPayload';

// Maps a module's event-doc effect union (Effect<type, data> — what action creators
// pass to askApplyEventDocEvent) to the shape the FOLD reducer receives: the stored
// event wraps the data in EventDocEventPayload (data + provenance metadata). One
// declaration of the effects serves both sides:
//
//   type TemplateEffects = TemplateSetTypeEffect | TemplateAddNodeEffect;
//   buildEffectReducer<TemplateState, EventDocFoldEffects<TemplateEffects>>({ ... })
export type EventDocFoldEffects<TEffects extends Effect<string, any>> =
  TEffects extends Effect<infer TType, infer TData> ? Effect<TType, EventDocEventPayload<TData>> : never;
