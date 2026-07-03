import { Effect } from 'quidproquo-core';

import {
  EventDocEffect,
  EventDocEventPayload,
  EventDocSetCodeData,
} from '../models';

// Reserved: edits the document code. Generic — folded by the base reducer.
export type SetCodeEffect = Effect<
  EventDocEffect.SetCode,
  EventDocEventPayload<EventDocSetCodeData>
>;
