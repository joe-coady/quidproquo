// How a slot's bound api routes askApplyEventDocEvent commits. A `document` slot
// buffers them into `pending` (the edit/save/cancel contract, backed by a real
// event-doc collection); a `local` slot writes straight into `history` (session-only
// state like the editor experience or chrome: no save concept, never persisted).
export enum EventDocWorkspaceSlotKind {
  document = 'document',
  local = 'local',
}
