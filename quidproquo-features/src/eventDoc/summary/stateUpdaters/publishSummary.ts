import {
  EventDocEventPayload,
  EventDocPublishData,
  EventDocSummary,
} from '../../models';

// PUBLISH stamps the open draft — the single version with no publishedAt — with when it
// was published (the event time) and when it takes effect (from the event). The version's
// `eventIndex` (where it opened) is already set by INIT_STATE/CREATE_DRAFT, so it stays.
export const publishSummary = (
  model: EventDocSummary,
  { data, metadata }: EventDocEventPayload<EventDocPublishData>
): EventDocSummary => ({
  ...model,
  versions: model.versions.map((version) =>
    version.publishedAt === undefined
      ? {
          ...version,
          publishedAt: metadata.createdAt,
          effectiveFrom: data.effectiveFrom,
        }
      : version
  ),
});
