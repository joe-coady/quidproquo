import { AskResponse, askThrowError, ErrorTypeEnum, QpqPagedData } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { eventDocWorkspaceEventsEndpoint } from './eventDocWorkspaceEventsEndpoint';

// One page of a document's event log. `afterIndex` (exclusive) fetches only events
// after that log index: the tail since a known point, for incremental refresh.
export function* askEventDocWorkspaceApiFetchEventsPage(
  identity: EventDocWorkspaceDocumentIdentity,
  nextPageKey?: string,
  afterIndex?: number,
): AskResponse<QpqPagedData<EventDocEvent>> {
  const params: Record<string, string> = {};
  if (nextPageKey !== undefined) {
    params.nextPageKey = nextPageKey;
  }
  if (afterIndex !== undefined) {
    params.afterIndex = String(afterIndex);
  }

  const response = yield* askApiRequest<void, QpqPagedData<EventDocEvent>>(
    identity.serviceName,
    'GET',
    eventDocWorkspaceEventsEndpoint(identity),
    Object.keys(params).length > 0 ? { params } : undefined,
  );

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Failed to load events (${response.status})`);
  }

  return response.data;
}
