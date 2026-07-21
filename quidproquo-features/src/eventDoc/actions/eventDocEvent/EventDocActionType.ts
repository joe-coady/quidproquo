// ApplyEvent is declarative — the verb yields it, an env-specific processor decides HOW
// (web: optimistic append + POST; backend: append). Features ships the action contract
// but no default processor; each consumer registers the one that fits its runtime.
// ApplyTransientEvent is its never-saved sibling: same routing, but the event lands in
// a transient group (keyed by transientKey) that is dropped wholesale, never persisted.
// ReadState is the read half of the same symmetry: "give me MY doc's current folded
// state" — answered by the enclosing slot binding (workspace: the memoized view
// selector over history + pending), so a doc verb reads and writes its own doc with
// zero knowledge of where it is mounted. ReadIdentity is its address sibling: "where
// does MY doc live" (serviceName/basePath/id; null until init, always null for
// unsaved docs) — for verbs that build EventDocLinks relative to their own doc.
export enum EventDocActionType {
  ApplyEvent = '@quidproquo-features/eventDoc/ApplyEvent',
  ApplyTransientEvent = '@quidproquo-features/eventDoc/ApplyTransientEvent',
  ReadState = '@quidproquo-features/eventDoc/ReadState',
  ReadIdentity = '@quidproquo-features/eventDoc/ReadIdentity',
}
