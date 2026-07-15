// How an EventDocLink resolves to a concrete event/version of its target document. The
// link stores only the pointer; the effective-at timestamp + draft/published processing
// mode are supplied at resolution time. For now only `Latest` is constructed/resolved —
// `Version` and `Exact` are modelled ahead of use.
export enum EventDocLinkMode {
  // The target's latest event at or before the effective-at time — its state as the referrer's
  // author saw it then, drafts included. The target needs NO published version of its own: a
  // published render resolves its links against the moment IT was published, so the document
  // renders as it looked at publish time. Draft: the latest event, full stop (no time bound).
  Latest = 'latest',
  // The latest event within a pinned documentVersion (modifiedAt <= effectiveAt).
  Version = 'version',
  // A single frozen event index — always exact, never resolved dynamically.
  Exact = 'exact',
}
