import { EventDocFunctions } from './types/EventDocFunctions';

export type EventDocFunctionsIdentity = {
  storeName: string;
  type: string;
};

// The registrable identity off a live EventDocFunctions object, with the guard every
// consumer needs: identity is optional on the type (client-only definitions), but a
// collection being registered, transferred or migrated must have one. Used by
// defineEventDoc and by consumers deriving registries (transfer collections,
// migration sweeps) from their collection lists.
export const getEventDocFunctionsIdentity = ({ storeName, type }: EventDocFunctions): EventDocFunctionsIdentity => {
  if (!storeName || !type) {
    throw new Error('EventDocFunctions object has no identity - set storeName and type on its definition.');
  }

  return { storeName, type };
};
