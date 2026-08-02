import { AskResponse } from 'quidproquo-core';

import { askEventDocProvideStore } from '../context/askEventDocProvideStore';
import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocGenerateAssetDownloadUrl } from '../data/askEventDocGenerateAssetDownloadUrl';
import { askEventDocGenerateAssetUploadUrl } from '../data/askEventDocGenerateAssetUploadUrl';
import { askEventDocList } from '../data/askEventDocList';
import { getEventDocFunctionsIdentity } from '../definition/getEventDocFunctionsIdentity';
import { EventDocFunctions } from '../definition/types/EventDocFunctions';
import { askEventDocAppendServerEvent } from '../logic/askEventDocAppendServerEvent';
import { askEventDocCreate } from '../logic/askEventDocCreate';
import { askEventDocEventsAsOf } from '../logic/askEventDocEventsAsOf';
import { askEventDocGetByCodeOrCreate } from '../logic/askEventDocGetByCodeOrCreate';
import { askEventDocGetByIdOrThrow } from '../logic/askEventDocGetByIdOrThrow';
import { askEventDocGetIdByCode } from '../logic/askEventDocGetIdByCode';
import { askEventDocPublishedEventsAsOf } from '../logic/askEventDocPublishedEventsAsOf';
import { askEventDocPublishedVersionAsOf } from '../logic/askEventDocPublishedVersionAsOf';
import { EventDocBackend } from './EventDocBackend';

// Bind the generic eventDoc verbs to ONE collection: identity comes off the definition
// (the single place it is declared), and every verb provides its own store context before
// delegating - the runtime counterpart of what defineEventDoc does for routes. Call this
// in SERVICE code (a data-layer one-liner per collection); the frontend imports the
// definition from shared-logic and never sees this surface.
export const createEventDocBackend = (functions: EventDocFunctions): EventDocBackend => {
  const identity = getEventDocFunctionsIdentity(functions);

  function* askProvideStore<T>(story: AskResponse<T>): AskResponse<T> {
    return yield* askEventDocProvideStore(identity, story);
  }

  return {
    *askGetByIdOrThrow(id) {
      return yield* askProvideStore(askEventDocGetByIdOrThrow(id));
    },
    *askGetIdByCode(code, ownerUserId) {
      return yield* askProvideStore(askEventDocGetIdByCode(code, ownerUserId));
    },
    *askGetByCodeOrCreate(code, name, actor, ownerUserId) {
      return yield* askProvideStore(askEventDocGetByCodeOrCreate(code, name, actor, ownerUserId));
    },
    *askList(options) {
      return yield* askProvideStore(askEventDocList(options));
    },
    *askCreate(name, code, actor) {
      return yield* askProvideStore(askEventDocCreate(name, code, actor));
    },
    *askEventListAll(modelId, options) {
      return yield* askProvideStore(askEventDocEventListAll(modelId, options));
    },
    *askEventsAsOf(id, clock) {
      return yield* askProvideStore(askEventDocEventsAsOf(id, clock));
    },
    *askPublishedVersionAsOf(id, clock) {
      return yield* askProvideStore(askEventDocPublishedVersionAsOf(id, clock));
    },
    *askPublishedEventsAsOf(id, clock) {
      return yield* askProvideStore(askEventDocPublishedEventsAsOf(id, clock));
    },
    *askAppendServerEvent(modelId, type, data, version, actor) {
      return yield* askProvideStore(askEventDocAppendServerEvent(modelId, type, data, version, actor));
    },
    *askGenerateAssetUploadUrl(docId, contentType, contentDisposition) {
      return yield* askProvideStore(askEventDocGenerateAssetUploadUrl(docId, contentType, contentDisposition));
    },
    *askGenerateAssetDownloadUrl(docId, assetId) {
      return yield* askProvideStore(askEventDocGenerateAssetDownloadUrl(docId, assetId));
    },
    askProvideStore,
  };
};
