import { EventDocFunctions } from './types/EventDocFunctions';

export type EventDocFunctionsExtensions = {
  render?: EventDocFunctions['render'];
};

// A definition plus its service-side extensions, as ONE registrable object. The
// definition stays shared-logic (frontend-safe); anything needing service code (a
// render that resolves linked docs or assets) is layered on here, in the service's
// entry file. Extensions are additive only: clobbering a definition member would let
// the registered surface disagree with what every other reader of the definition sees.
// extend*, not create*: it returns the same shape it takes, with members added - a
// definition with no extensions registers verbatim, no wrapper needed.
export const extendEventDocFunctions = (definition: EventDocFunctions, extensions?: EventDocFunctionsExtensions): EventDocFunctions => {
  const members = definition as Record<string, unknown>;
  const collisions = Object.keys(extensions ?? {}).filter((extensionName) => members[extensionName] !== undefined);

  if (collisions.length > 0) {
    throw new Error(`event doc functions extensions redefine definition member(s): ${collisions.join(', ')} - extensions are additive only.`);
  }

  return { ...definition, ...extensions };
};
