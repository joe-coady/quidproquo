// ApplyEvent is declarative — the verb yields it, an env-specific processor decides HOW
// (web: optimistic append + POST; backend: append). Features ships the action contract
// but no default processor; each consumer registers the one that fits its runtime.
// ApplyTransientEvent is its never-saved sibling: same routing, but the event lands in
// a transient group (keyed by transientKey) that is dropped wholesale, never persisted.
export enum EventDocActionType {
  ApplyEvent = '@quidproquo-features/eventDoc/ApplyEvent',
  ApplyTransientEvent = '@quidproquo-features/eventDoc/ApplyTransientEvent',
}
