import { QPQBinaryData } from 'quidproquo-core';

// One immutable asset blob, carried by value. `guid` is the doc-scoped asset id (the last
// segment of `<docId>/assets/<guid>`) and is preserved on import, so a doc's EventDocAssetRefs
// keep resolving. The original filename/mimetype live in whichever event recorded the ref, so
// what travels here is just the bytes the drive needs.
export type EventDocBundleAsset = {
  guid: string;
  data: QPQBinaryData;
};
