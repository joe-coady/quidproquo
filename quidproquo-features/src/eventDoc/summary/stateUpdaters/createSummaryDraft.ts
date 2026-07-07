import { EventDocEventPayload, EventDocSummary } from '../../models';

// CREATE_DRAFT appends the next version (versions are contiguous 1-based, so length + 1),
// seeding the new version's `eventIndex` head with this event's log index (the applier
// then advances it as further events append). If a draft is already open (an unpublished
// version exists) it's a no-op — validation rejects that case upstream, this stays robust.
export const createSummaryDraft = (model: EventDocSummary, { metadata }: EventDocEventPayload): EventDocSummary => {
  if (model.versions.some((version) => version.publishedAt === undefined)) {
    return model;
  }

  return {
    ...model,
    versions: [...model.versions, { version: model.versions.length + 1, eventIndex: metadata.index }],
  };
};
