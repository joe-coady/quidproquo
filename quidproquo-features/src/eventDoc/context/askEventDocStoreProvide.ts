import { createContextProvider } from 'quidproquo-core';

import { EventDocStore } from '../types/EventDocStore';
import { eventDocStoreContext } from './eventDocStoreContext';

export const askEventDocStoreProvide = createContextProvider(
  eventDocStoreContext,
  (store: EventDocStore) => store
);
