import { askCatch, askFileListAllDirectory, askFileListDirectory, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { askEventDocResolveScope } from './askEventDocResolveScope';
import { eventDocAssetFolderPath } from './eventDocAssetPath';

// The guid is the blob's last path segment; a listing never returns an empty segment, so this
// is a total function rather than a filtered one.
const assetGuidFromFilepath = (filepath: string): string => filepath.split('/').slice(-1)[0];

// Every asset guid a doc holds, by listing its `<docId>/assets/` prefix on the collection's blob
// drive. Guids only: the original filename and mimetype are NOT stored alongside the blob, they
// live in whichever domain event recorded the EventDocAssetRef, which is why a transfer bundle
// carries the events too.
//
// A doc that has never uploaded anything has no such prefix, and the platforms disagree about what
// that means: S3 lists a nonexistent prefix as empty, while a filesystem-backed drive (the dev
// server) raises DirectoryNotFound. Normalised to [] here so "no assets yet" reads the same
// everywhere - otherwise exporting any asset-free doc fails locally and works deployed. Every other
// listing failure still propagates.
export function* askEventDocListAssets(docId: string): AskResponse<string[]> {
  const { storageDriveName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const listed = yield* askCatch(askFileListAllDirectory(storageDriveName, eventDocAssetFolderPath(docId), scope));

  if (!listed.success) {
    if (listed.error.errorType === askFileListDirectory.errorType.DirectoryNotFound) {
      return [];
    }

    return yield* askThrowError(listed.error.errorType as ErrorTypeEnum, listed.error.errorText, listed.error.errorStack);
  }

  return listed.result.filter((fileInfo) => !fileInfo.isDir).map((fileInfo) => assetGuidFromFilepath(fileInfo.filepath));
}
