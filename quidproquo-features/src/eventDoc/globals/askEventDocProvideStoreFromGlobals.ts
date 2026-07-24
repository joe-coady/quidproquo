import { askCatch, askConfigGetGlobal, AskResponse } from 'quidproquo-core';

import {
  EVENT_DOC_EVENT_VALIDATOR_GLOBAL,
  EVENT_DOC_EVENTS_STORE_NAME_GLOBAL,
  EVENT_DOC_ON_APPEND_GLOBAL,
  EVENT_DOC_ON_PUBLISH_GLOBAL,
  EVENT_DOC_RENDERER_GLOBAL,
  EVENT_DOC_SCOPE_RESOLVER_GLOBAL,
  EVENT_DOC_STORAGE_DRIVE_GLOBAL,
  EVENT_DOC_STORE_NAME_GLOBAL,
  EVENT_DOC_TYPE_GLOBAL,
} from '../constants/eventDocGlobalNames';
import { askEventDocStoreProvide } from '../context/askEventDocStoreProvide';

// TOOD: Revisit this, i feel like we dont need this function?.
//       the items should be the same as the other globals.
// Globals added AFTER the original six-key route contract: a consumer whose
// routes were registered before the key existed has no global at all, which
// must read as "hook not configured" ('', exactly what the definers emit for
// an unset hook), not a request-time throw. The definers themselves always set
// every key via buildEventDocStoreGlobals - its drift-guard test keeps that
// true - so the soft read only ever fires for pre-upgrade consumers.
function* askConfigGetGlobalAddedAfterV1(globalName: string): AskResponse<string> {
  const result = yield* askCatch(askConfigGetGlobal<string>(globalName));
  return (result.success && result.result) || '';
}

// Bridge per-route globals → store context for the controllers. askConfigGetGlobal
// throws if a route forgot to set them.
export function* askEventDocProvideStoreFromGlobals<T>(story: AskResponse<T>): AskResponse<T> {
  const storeName = yield* askConfigGetGlobal<string>(EVENT_DOC_STORE_NAME_GLOBAL);
  const eventsStoreName = yield* askConfigGetGlobal<string>(EVENT_DOC_EVENTS_STORE_NAME_GLOBAL);
  const type = yield* askConfigGetGlobal<string>(EVENT_DOC_TYPE_GLOBAL);
  const storageDriveName = yield* askConfigGetGlobal<string>(EVENT_DOC_STORAGE_DRIVE_GLOBAL);
  // Empty string when the collection configured no validator/renderer/on-publish/scope-resolver (see defineEventDocRoutes).
  const eventValidator = yield* askConfigGetGlobal<string>(EVENT_DOC_EVENT_VALIDATOR_GLOBAL);
  const eventRenderer = yield* askConfigGetGlobal<string>(EVENT_DOC_RENDERER_GLOBAL);
  const onPublish = yield* askConfigGetGlobalAddedAfterV1(EVENT_DOC_ON_PUBLISH_GLOBAL);
  const onAppend = yield* askConfigGetGlobalAddedAfterV1(EVENT_DOC_ON_APPEND_GLOBAL);
  const scopeResolver = yield* askConfigGetGlobalAddedAfterV1(EVENT_DOC_SCOPE_RESOLVER_GLOBAL);

  return yield* askEventDocStoreProvide(
    {
      storeName,
      eventsStoreName,
      type,
      storageDriveName,
      eventValidator,
      eventRenderer,
      onPublish,
      onAppend,
      scopeResolver,
    },
    story,
  );
}
