import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { EventDocRenderOptions, EventDocRenderResult } from '../../models';
import { eventDocRenderEndpoint } from './eventDocRenderEndpoint';

// Fetch a document's server-rendered output (the generic GET {basePath}/{id}/render route).
// Resolves an EventDocLink's target to rendered HTML — the caller maps the link's type to its
// basePath. `renderMode` (draft|published) + `effectiveAt` (as-of time), when supplied, are sent
// as query params so the server can resolve the right version. Auto base-url + auth via askApiRequest.
export function* askEventDocRenderFetch(
  serviceName: string,
  basePath: string,
  id: string,
  options?: EventDocRenderOptions,
): AskResponse<EventDocRenderResult> {
  const params: Record<string, string> = {};
  if (options?.renderMode) {
    params.renderMode = options.renderMode;
  }
  if (options?.effectiveAt) {
    params.effectiveAt = options.effectiveAt;
  }

  const response = yield* askApiRequest<void, EventDocRenderResult>(
    serviceName,
    'GET',
    eventDocRenderEndpoint(basePath, id),
    Object.keys(params).length > 0 ? { params } : undefined,
  );

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Failed to render ${basePath}/${id} (${response.status})`);
  }

  return response.data;
}
