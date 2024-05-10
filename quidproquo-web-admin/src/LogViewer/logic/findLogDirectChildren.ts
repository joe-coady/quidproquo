import { apiRequestGet, cache } from '../../logic';
import { QpqPagedData, StoryResultMetadata } from 'quidproquo-core';

export const fineLogDirectChildren = cache(async function findLogDirectChildren(
  logCorrelation: string,
  accessToken?: string,
): Promise<StoryResultMetadata[]> {
  try {
    // TODO: Paging
    const fetchedChildLogs = await apiRequestGet<QpqPagedData<StoryResultMetadata>>(
      `/log/children/${logCorrelation}`,
      accessToken,
    );

    return fetchedChildLogs.items;
  } catch (error) {
    console.error(`Error fetching child logs for correlation ${logCorrelation}:`, error);
    return [];
  }
});
