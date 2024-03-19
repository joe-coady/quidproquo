import { StoryResultMetadataLog } from '../../types';
import { apiRequestGet } from '../../logic';
import { QpqPagedData } from 'quidproquo-core';
import { cache } from '../../logic/cache';

export const fineLogDirectChildren = cache(async function findLogDirectChildren(
  logCorrelation: string,
  accessToken?: string,
): Promise<StoryResultMetadataLog[]> {
  try {
    // TODO: Paging
    const fetchedChildLogs = await apiRequestGet<QpqPagedData<StoryResultMetadataLog>>(
      `/log/children/${logCorrelation}`,
      accessToken,
    );

    return fetchedChildLogs.items;
  } catch (error) {
    console.error(`Error fetching child logs for correlation ${logCorrelation}:`, error);
    return [];
  }
});
