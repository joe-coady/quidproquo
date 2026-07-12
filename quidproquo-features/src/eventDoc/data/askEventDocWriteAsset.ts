import { askFileWriteBinaryContents, askNewGuid, AskResponse, QPQBinaryData } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocAssetRef } from '../models';
import { askEventDocResolveScope } from './askEventDocResolveScope';

const FALLBACK_MIMETYPE = 'application/octet-stream';

// Write a server-generated binary as an immutable asset on the (provided) collection's blob drive,
// under the standard `<docId>/assets/<guid>` scheme, and return its ref. The server-side twin of the
// presigned upload flow (askEventDocGenerateAssetUploadUrl) — for when the backend itself holds the
// bytes (e.g. a rendered PDF) and no client round-trip is needed. Assumes the store context is
// provided (wrap in askEventDocProvideStore); the download route serves it back via the same key.
export function* askEventDocWriteAsset(docId: string, binary: QPQBinaryData): AskResponse<EventDocAssetRef> {
  const { storageDriveName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();
  const guid = yield* askNewGuid();

  yield* askFileWriteBinaryContents(storageDriveName, `${docId}/assets/${guid}`, binary, undefined, scope);

  return {
    guid,
    filename: binary.filename,
    mimetype: binary.mimetype ?? FALLBACK_MIMETYPE,
  };
}
