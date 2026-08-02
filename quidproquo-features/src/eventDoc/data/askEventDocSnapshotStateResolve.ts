import { askCatch, askFileReadTextContents, AskResponse, Nullable } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocStoredSnapshot } from '../types/EventDocStoredSnapshot';
import { askEventDocResolveScope } from './askEventDocResolveScope';
import { eventDocSnapshotPath } from './eventDocSnapshotPath';

// A snapshot row's state, wherever it lives: on the row, or offloaded on the blob drive at
// the path derived from the row's own keys. A missing/unreadable blob resolves to null —
// the caller treats the whole snapshot as unusable rather than folding a view from nothing.
// The wrapper object distinguishes "unusable" (null) from a state that is legitimately null.
export function* askEventDocSnapshotStateResolve(
  docId: string,
  viewName: string,
  row: EventDocStoredSnapshot,
): AskResponse<Nullable<{ state: unknown }>> {
  if (row.data.type === 'inline') {
    return { state: row.data.snapshot };
  }

  const { storageDriveName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const read = yield* askCatch(askFileReadTextContents(storageDriveName, eventDocSnapshotPath(docId, viewName, row.sk), scope));

  return read.success ? { state: JSON.parse(read.result) } : null;
}
