// ApplyEvent is declarative — the verb yields it, an env-specific processor decides HOW
// (web: optimistic append + POST; backend: append). Features ships the action contract
// but no default processor; each consumer registers the one that fits its runtime.
export enum EventDocActionType {
  ApplyEvent = '@quidproquo-features/eventDoc/ApplyEvent',
}
