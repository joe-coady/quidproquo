import { askInlineFunctionExecute, AskResponse, askThrowError, ErrorTypeEnum, getValidQpqIsoDateTime } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocResolveStore } from '../../context/askEventDocResolveStore';
import { askEventDocEventListAll } from '../../data/askEventDocEventListAll';
import { askEventDocProvideRequestScope } from '../../globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';
import { EventDocRenderInput, EventDocRenderMode, EventDocRenderResult } from '../../models';

// Render the document to HTML: load its full event log and invoke the collection's
// configured renderer inline function (which folds + renders). The generic controller stays
// app-agnostic — the per-type render (e.g. `foldLayout(events).html`) lives in the
// service's registered inline function, exactly like the `eventValidator` pattern. `renderMode`
// (draft|published) and `effectiveAt` (as-of time) are read from the query string and threaded
// into the render input — modelled now, honoured once version/effectiveAt resolution lands.
function* askEventDocStoreRender(event: HTTPEvent, modelId: string): AskResponse<HTTPEventResponse> {
  const { eventRenderer } = yield* askEventDocResolveStore();

  if (!eventRenderer) {
    return yield* askThrowError(ErrorTypeEnum.NotFound, 'This collection has no renderer configured.');
  }

  const events = yield* askEventDocEventListAll(modelId);

  const renderModeParam = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'renderMode');
  const renderMode = renderModeParam === EventDocRenderMode.Draft || renderModeParam === EventDocRenderMode.Published ? renderModeParam : undefined;
  const effectiveAt = getValidQpqIsoDateTime(qpqWebServerUtils.readUriQueryParamFromEvent(event, 'effectiveAt'));

  const result = yield* askInlineFunctionExecute<EventDocRenderResult, EventDocRenderInput>(eventRenderer, {
    events,
    docId: modelId,
    renderMode,
    effectiveAt,
  });

  return qpqWebServerUtils.toJsonEventResponse(result);
}

// GET {basePath}/{id}/render — mounted only when the collection configures an eventRenderer.
export function* render(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askEventDocStoreRender(event, params.id)));
}
