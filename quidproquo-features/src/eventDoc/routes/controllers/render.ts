import {
  askDateNow,
  askInlineFunctionExecute,
  AskResponse,
  askThrowError,
  ErrorTypeEnum,
  getValidQpqIsoDateTime,
  QpqIsoDateTime,
} from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocResolveStore } from '../../context/askEventDocResolveStore';
import { askEventDocEventListAll } from '../../data/askEventDocEventListAll';
import { askEventDocProvideRequestScope } from '../../globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';
import { askEventDocPublishedVersionAsOf } from '../../logic/askEventDocPublishedVersionAsOf';
import { EventDocEvent, EventDocRenderInput, EventDocRenderMode, EventDocRenderResult, EventDocVersion } from '../../models';

type ResolvedRender = {
  events: EventDocEvent[];
  version?: EventDocVersion;
};

// Apply the request's resolution options to get the log the renderer should fold. Published resolves
// the version effective at the clock (defaulting to now) and returns its event slice plus the version
// itself — the renderer needs `version.publishedAt` to resolve its own links as of the publish
// moment, which it cannot derive from the events. Draft (or an unspecified mode) is the whole log,
// as it stands: a draft has no time bound. Published with nothing effective is a 404 rather than a
// silent fallback to the draft — a caller asking for the published document must not be handed
// unpublished work.
function* askEventDocRenderResolve(
  modelId: string,
  renderMode: EventDocRenderMode | undefined,
  effectiveAt?: QpqIsoDateTime,
): AskResponse<ResolvedRender> {
  if (renderMode !== EventDocRenderMode.Published) {
    return { events: yield* askEventDocEventListAll(modelId) };
  }

  const clock = effectiveAt ?? ((yield* askDateNow()) as QpqIsoDateTime);
  const slice = yield* askEventDocPublishedVersionAsOf(modelId, clock);
  if (!slice) {
    return yield* askThrowError(ErrorTypeEnum.NotFound, `No published version is effective as of ${clock}.`);
  }

  return { events: slice.events, version: slice.version };
}

// Render the document to HTML: resolve the event log the request asked for and invoke the
// collection's configured renderer inline function (which folds + renders). The generic controller
// stays app-agnostic — the per-type render (e.g. `foldLayout(events).html`) lives in the service's
// registered inline function, exactly like the `eventValidator` pattern. `renderMode`
// (draft|published) and `effectiveAt` (as-of time) are read from the query string and applied HERE,
// so the renderer receives an already-resolved log plus the version behind it; the options are
// echoed into the input for context only.
function* askEventDocStoreRender(event: HTTPEvent, modelId: string): AskResponse<HTTPEventResponse> {
  const { eventRenderer } = yield* askEventDocResolveStore();

  if (!eventRenderer) {
    return yield* askThrowError(ErrorTypeEnum.NotFound, 'This collection has no renderer configured.');
  }

  const renderModeParam = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'renderMode');
  const renderMode = renderModeParam === EventDocRenderMode.Draft || renderModeParam === EventDocRenderMode.Published ? renderModeParam : undefined;
  const effectiveAt = getValidQpqIsoDateTime(qpqWebServerUtils.readUriQueryParamFromEvent(event, 'effectiveAt'));

  const { events, version } = yield* askEventDocRenderResolve(modelId, renderMode, effectiveAt);

  const result = yield* askInlineFunctionExecute<EventDocRenderResult, EventDocRenderInput>(eventRenderer, {
    events,
    docId: modelId,
    version,
    renderMode,
    effectiveAt,
  });

  return qpqWebServerUtils.toJsonEventResponse(result);
}

// GET {basePath}/{id}/render — mounted only when the collection configures an eventRenderer.
export function* render(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askEventDocStoreRender(event, params.id)));
}
