import { Effect } from 'quidproquo-core';

import { VolatileEffect } from './VolatileEffect';

export type VolatileServiceNamesLoadedPayload = {
  serviceNames: string[];
};

export type VolatileServiceNamesLoadedEffect = Effect<VolatileEffect.serviceNamesLoaded, VolatileServiceNamesLoadedPayload>;
