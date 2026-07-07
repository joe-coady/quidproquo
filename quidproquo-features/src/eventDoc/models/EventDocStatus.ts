// Document lifecycle status, folded from the reserved events: INIT/CREATE_DRAFT →
// Draft, PUBLISH → Published. Deprecated (a future DEPRECATE event) is not folded yet.
export enum EventDocStatus {
  Draft = 'draft',
  Published = 'published',
}
