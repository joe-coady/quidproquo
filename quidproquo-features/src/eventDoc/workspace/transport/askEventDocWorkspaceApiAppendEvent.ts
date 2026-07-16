import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { EventDocEvent, EventDocEventInput } from '../../models';
import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { eventDocWorkspaceEventsEndpoint } from './eventDocWorkspaceEventsEndpoint';

// Appends one event to the document's log. The backend validates version
// monotonicity, dedups by clientMessageId, stamps createdBy/createdAt/index, and
// returns the full stored event. This is the EventDocWorkspaceTransport.askAppendEvent
// shape.
export function* askEventDocWorkspaceApiAppendEvent(
  identity: EventDocWorkspaceDocumentIdentity,
  input: EventDocEventInput,
): AskResponse<EventDocEvent> {
  const response = yield* askApiRequest<EventDocEventInput, EventDocEvent>(identity.serviceName, 'POST', eventDocWorkspaceEventsEndpoint(identity), {
    body: input,
  });

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Failed to save event (${response.status})`);
  }

  return response.data;
}
