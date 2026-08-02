import { AskResponse, Nullable, QpqIsoDateTime } from 'quidproquo-core';

import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocList } from '../data/askEventDocList';
import {
  EventDocAssetDownloadUrl,
  EventDocAssetUploadUrl,
  EventDocEvent,
  EventDocEventActor,
  EventDocSummary,
  EventDocVersionSlice,
} from '../models';

// A doc type's generic verbs BOUND to its collection: every call establishes the store
// context from the definition's identity, so callers outside defineEventDocRoutes (queue
// workers, AI logic, custom routes) never provide context by hand. Built by
// createEventDocBackend in SERVICE code only - the definition itself stays frontend-safe
// and never carries this surface.
export type EventDocBackend = {
  askGetByIdOrThrow: (id: string) => AskResponse<EventDocSummary>;
  askGetIdByCode: (code: string, ownerUserId?: string) => AskResponse<Nullable<string>>;
  askGetByCodeOrCreate: (code: string, name: string, actor: EventDocEventActor, ownerUserId?: string) => AskResponse<EventDocSummary>;
  askList: (options?: Parameters<typeof askEventDocList>[0]) => AskResponse<EventDocSummary[]>;
  askCreate: (name: string, code: string, actor: EventDocEventActor) => AskResponse<EventDocSummary>;
  askEventListAll: (modelId: string, options?: Parameters<typeof askEventDocEventListAll>[1]) => AskResponse<EventDocEvent[]>;
  askEventsAsOf: (id: string, clock: QpqIsoDateTime) => AskResponse<EventDocEvent[]>;
  askPublishedVersionAsOf: (id: string, clock: QpqIsoDateTime) => AskResponse<Nullable<EventDocVersionSlice>>;
  askPublishedEventsAsOf: (id: string, clock: QpqIsoDateTime) => AskResponse<Nullable<EventDocEvent[]>>;
  askAppendServerEvent: <T>(modelId: string, type: string, data: T, version: number, actor: EventDocEventActor) => AskResponse<EventDocEvent>;
  askGenerateAssetUploadUrl: (docId: string, contentType: string, contentDisposition?: string) => AskResponse<EventDocAssetUploadUrl>;
  askGenerateAssetDownloadUrl: (docId: string, assetId: string) => AskResponse<EventDocAssetDownloadUrl>;

  // The escape hatch for a multi-verb block: run any story under this collection's store
  // context - the bound twin of askEventDocProvideStore.
  askProvideStore: <T>(story: AskResponse<T>) => AskResponse<T>;
};
