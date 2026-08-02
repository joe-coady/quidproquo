import {
  askCatch,
  askDateNow,
  AskResponse,
  askThrowError,
  createDynamicFunctionCaller,
  ErrorTypeEnum,
  getValidQpqIsoDateTime,
  QpqIsoDateTime,
} from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { eventDocFunctionsName } from '../../constants/eventDocFunctionsName';
import { askEventDocResolveStore } from '../../context/askEventDocResolveStore';
import { EventDocInvokableFunctions } from '../../definition/types/EventDocInvokableFunctions';
import { askEventDocProvideRequestScope } from '../../globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';
import { askEventDocDocumentStateLatest } from '../../logic/askEventDocDocumentStateLatest';
import { askEventDocPublishedVersionAsOf } from '../../logic/askEventDocPublishedVersionAsOf';
import { isEventDocFunctionsMissing } from '../../logic/isEventDocFunctionsMissing';
import { EventDocRenderMode, EventDocVersion } from '../../models';

type ResolvedRender = {
  state: unknown;
  version?: EventDocVersion;
};

// Apply the request's resolution options to get the STATE the renderer should render — folded
// snapshot-seeded, never a whole-log replay. Published resolves the version effective at the
// clock (defaulting to now) and returns the state at that version's head plus the version itself
// — the renderer needs `version.publishedAt` to resolve its own links as of the publish moment,
// which it cannot derive from the state. Draft (or an unspecified mode) is the state at the log's
// head, as it stands: a draft has no time bound. Published with nothing effective is a 404 rather
// than a silent fallback to the draft — a caller asking for the published document must not be
// handed unpublished work. A doc with no events at all is a 404: there is no document to render.
function* askEventDocRenderResolve(
  modelId: string,
  renderMode: EventDocRenderMode | undefined,
  effectiveAt?: QpqIsoDateTime,
): AskResponse<ResolvedRender> {
  if (renderMode !== EventDocRenderMode.Published) {
    const stateAtHead = yield* askEventDocDocumentStateLatest(modelId);
    if (!stateAtHead) {
      return yield* askThrowError(ErrorTypeEnum.NotFound, `Document not found: ${modelId}`);
    }

    return { state: stateAtHead.state };
  }

  const clock = effectiveAt ?? ((yield* askDateNow()) as QpqIsoDateTime);
  const versionState = yield* askEventDocPublishedVersionAsOf(modelId, clock);
  if (!versionState) {
    return yield* askThrowError(ErrorTypeEnum.NotFound, `No published version is effective as of ${clock}.`);
  }

  return { state: versionState.state, version: versionState.version };
}

// Render the document to HTML: resolve the state the request asked for and invoke the
// `render` member of the collection's registered EventDocFunctions object. The generic
// controller stays app-agnostic — the per-type render (e.g. `renderLayoutHtml(state)`)
// lives on the service's registered object. `renderMode` (draft|published) and
// `effectiveAt` (as-of time) are read from the query string and applied HERE, so the
// renderer receives an already-folded state plus the version behind it; the options are
// echoed into the input for context only.
function* askEventDocStoreRender(event: HTTPEvent, modelId: string): AskResponse<HTTPEventResponse> {
  const { storeName, type } = yield* askEventDocResolveStore();

  const renderModeParam = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'renderMode');
  const renderMode = renderModeParam === EventDocRenderMode.Draft || renderModeParam === EventDocRenderMode.Published ? renderModeParam : undefined;
  const effectiveAt = getValidQpqIsoDateTime(qpqWebServerUtils.readUriQueryParamFromEvent(event, 'effectiveAt'));

  // State resolution folds through the registered functions object too, so a
  // collection with none surfaces functions-missing HERE, before the render call —
  // same outcome, same 404.
  const resolved = yield* askCatch(askEventDocRenderResolve(modelId, renderMode, effectiveAt));

  if (!resolved.success) {
    if (isEventDocFunctionsMissing(resolved.error.errorType)) {
      return yield* askThrowError(ErrorTypeEnum.NotFound, 'This collection has no renderer configured.');
    }

    return yield* askThrowError(resolved.error.errorType, resolved.error.errorText);
  }

  const { state, version } = resolved.result;

  const functionsCaller = createDynamicFunctionCaller<EventDocInvokableFunctions>(eventDocFunctionsName(storeName, type));
  const rendered = yield* askCatch(
    functionsCaller.render({
      state,
      docId: modelId,
      version,
      renderMode,
      effectiveAt,
    }),
  );

  if (!rendered.success) {
    // No registered functions object, or one without a render member, is simply "no
    // renderer configured" — the same 404 as before the object existed. Anything else is
    // a configured renderer failing and must propagate as-is.
    if (isEventDocFunctionsMissing(rendered.error.errorType)) {
      return yield* askThrowError(ErrorTypeEnum.NotFound, 'This collection has no renderer configured.');
    }

    return yield* askThrowError(rendered.error.errorType, rendered.error.errorText);
  }

  return qpqWebServerUtils.toJsonEventResponse(rendered.result);
}

// GET {basePath}/{id}/render — 404s unless the collection's functions object has a render member.
export function* render(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askEventDocStoreRender(event, params.id)));
}
