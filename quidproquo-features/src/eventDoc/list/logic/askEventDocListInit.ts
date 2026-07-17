import { AskResponse } from 'quidproquo-core';

import { askUIEventDocListSetConfig } from '../actionCreators/askUIEventDocListSetConfig';
import type { EventDocListConfig } from '../types/EventDocListConfig';
import { askEventDocListLoad } from './askEventDocListLoad';

// Stores the host-supplied config and does the first load. The host builds the
// config from wherever its list instance is parameterised (doccypoccy: the tab's
// module params) and wraps this in its own init story.
export function* askEventDocListInit(config: EventDocListConfig): AskResponse<void> {
  yield* askUIEventDocListSetConfig(config);
  yield* askEventDocListLoad(config.serviceName, config.listBasePath || config.basePath);
}
