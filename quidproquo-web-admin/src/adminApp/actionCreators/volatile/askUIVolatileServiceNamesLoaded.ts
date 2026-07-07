import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { VolatileEffect } from '../../effects/volatile/VolatileEffect';
import { VolatileServiceNamesLoadedEffect } from '../../effects/volatile/VolatileServiceNamesLoadedEffect';

export function* askUIVolatileServiceNamesLoaded(serviceNames: string[]): AskResponse<void> {
  yield* askStateDispatchEffect<VolatileServiceNamesLoadedEffect>(VolatileEffect.serviceNamesLoaded, { serviceNames });
}
