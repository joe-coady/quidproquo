import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { EventDocEventBootstrapPage } from '../../models';
import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { eventDocWorkspaceEventsEndpoint } from './eventDocWorkspaceEventsEndpoint';

// The opening page of a document's log: includeBase asks the events route for the
// newest snapshot base plus the events after it (base: null + the log's first page
// when the server has no usable snapshot). Only the FIRST page carries the base —
// paging continues through the plain events page with afterEventId = base.eventId,
// so the base is resolved exactly once per load.
export function* askEventDocWorkspaceApiFetchBootstrapPage(identity: EventDocWorkspaceDocumentIdentity): AskResponse<EventDocEventBootstrapPage> {
  const response = yield* askApiRequest<void, EventDocEventBootstrapPage>(identity.serviceName, 'GET', eventDocWorkspaceEventsEndpoint(identity), {
    params: { includeBase: 'true' },
  });

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Failed to load events (${response.status})`);
  }

  return response.data;
}
