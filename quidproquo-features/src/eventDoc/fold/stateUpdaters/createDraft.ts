import { EventDocDocument, EventDocStatus } from '../../models';

// CREATE_DRAFT flips to draft and bumps documentVersion only when leaving published
// (no bump if already a draft).
export const createDraft = <TState extends EventDocDocument>(
  state: TState
): TState => ({
  ...state,
  status: EventDocStatus.Draft,
  documentVersion:
    state.status === EventDocStatus.Published
      ? state.documentVersion + 1
      : state.documentVersion,
});
