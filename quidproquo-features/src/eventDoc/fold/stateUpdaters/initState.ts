import { EventDocDocument, EventDocEventPayload, EventDocInitData, EventDocStatus } from '../../models';

// INIT resets to the module's initial state, then stamps the document's identity
// (id/code/name from the event) and timestamps (both from INIT's time). Closes over
// getInitialState since the initial shape is the module's, not the base's.
export const initState =
  <TState extends EventDocDocument>(getInitialState: () => TState) =>
  (_state: TState, { data, metadata }: EventDocEventPayload<EventDocInitData>): TState => ({
    ...getInitialState(),
    id: data.id,
    code: data.code,
    name: data.name,
    documentVersion: 1,
    status: EventDocStatus.Draft,
    createdAt: metadata.createdAt,
    updatedAt: metadata.createdAt,
  });
