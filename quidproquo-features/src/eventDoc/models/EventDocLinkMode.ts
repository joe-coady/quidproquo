// How an EventDocLink resolves to a concrete event/version of its target document. The
// link stores only the pointer; the effective-at timestamp + draft/published processing
// mode are supplied at resolution time. For now only `Latest` is constructed/resolved —
// `Version` and `Exact` are modelled ahead of use.
export enum EventDocLinkMode {
  // Published: the latest published version (publishedAt <= effectiveAt).
  // Draft: the latest event (latest draft, or the published head if published).
  Latest = 'latest',
  // The latest event within a pinned documentVersion (modifiedAt <= effectiveAt).
  Version = 'version',
  // A single frozen event index — always exact, never resolved dynamically.
  Exact = 'exact',
}
