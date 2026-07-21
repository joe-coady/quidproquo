import { askEventDocCreateDraft } from '../actionCreators/askEventDocCreateDraft';
import { askEventDocPublish } from '../actionCreators/askEventDocPublish';
import { askEventDocSetCode } from '../actionCreators/askEventDocSetCode';
import { askEventDocSetName } from '../actionCreators/askEventDocSetName';

// The verbs EVERY saved event doc has: the reserved identity + lifecycle events.
// createEventDocDefinition merges these into each saved definition's api, so editors
// never hand-spread them; a domain api redefining one of these names throws there.
export const eventDocGenericApi = {
  askEventDocSetCode,
  askEventDocSetName,
  askEventDocCreateDraft,
  askEventDocPublish,
};

export type EventDocGenericApi = typeof eventDocGenericApi;
