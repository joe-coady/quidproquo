import { createContextReader } from 'quidproquo-core';

import { eventDocStoreContext } from './eventDocStoreContext';

export const askEventDocStoreRead = createContextReader(eventDocStoreContext);
