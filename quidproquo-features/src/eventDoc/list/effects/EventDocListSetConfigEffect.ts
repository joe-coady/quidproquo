import { Effect } from 'quidproquo-core';

import { EventDocListConfig } from '../types/EventDocListConfig';
import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListSetConfigPayload = EventDocListConfig;

export type EventDocListSetConfigEffect = Effect<EventDocListEffect.SetConfig, EventDocListSetConfigPayload>;
