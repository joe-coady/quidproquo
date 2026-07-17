// What a slot's streams mean. Every slot's commits buffer into `pending`; `history` is
// strictly append-only server truth. A `document` slot is backed by a real event-doc
// collection (the edit/save/cancel contract moves pending into history); a `local`
// slot is session-only state like the editor experience or chrome: it has no
// documentIdentity, so its pending never saves and its history stays empty.
export enum EventDocWorkspaceSlotKind {
  document = 'document',
  local = 'local',
}
