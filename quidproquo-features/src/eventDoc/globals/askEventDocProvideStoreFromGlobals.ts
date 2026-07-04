import { askConfigGetGlobal, AskResponse } from 'quidproquo-core';

import {
  EVENT_DOC_EVENT_VALIDATOR_GLOBAL,
  EVENT_DOC_EVENTS_STORE_NAME_GLOBAL,
  EVENT_DOC_RENDERER_GLOBAL,
  EVENT_DOC_STORAGE_DRIVE_GLOBAL,
  EVENT_DOC_STORE_NAME_GLOBAL,
  EVENT_DOC_TYPE_GLOBAL,
} from '../constants/eventDocGlobalNames';
import { askEventDocStoreProvide } from '../context/askEventDocStoreProvide';

// Bridge per-route globals → store context for the controllers. askConfigGetGlobal
// throws if a route forgot to set them.
export function* askEventDocProvideStoreFromGlobals<T>(story: AskResponse<T>): AskResponse<T> {
  const storeName = yield* askConfigGetGlobal<string>(EVENT_DOC_STORE_NAME_GLOBAL);
  const eventsStoreName = yield* askConfigGetGlobal<string>(EVENT_DOC_EVENTS_STORE_NAME_GLOBAL);
  const type = yield* askConfigGetGlobal<string>(EVENT_DOC_TYPE_GLOBAL);
  const storageDriveName = yield* askConfigGetGlobal<string>(EVENT_DOC_STORAGE_DRIVE_GLOBAL);
  // Empty string when the collection configured no validator/renderer (see defineEventDocRoutes).
  const eventValidator = yield* askConfigGetGlobal<string>(EVENT_DOC_EVENT_VALIDATOR_GLOBAL);
  const eventRenderer = yield* askConfigGetGlobal<string>(EVENT_DOC_RENDERER_GLOBAL);

  return yield* askEventDocStoreProvide(
    {
      storeName,
      eventsStoreName,
      type,
      storageDriveName,
      eventValidator,
      eventRenderer,
    },
    story,
  );
}
