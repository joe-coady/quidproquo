import { StoryResultMetadata } from 'quidproquo';
import { apiRequestGet } from '../../logic';
import { cache } from '../../logic/cache';

export const findRootLog = cache(async function findRootLog(
  fromCorrelation?: string,
  accessToken?: string,
): Promise<StoryResultMetadata | undefined> {
  if (!fromCorrelation) {
    return;
  }

  try {
    const parentLog = await apiRequestGet<StoryResultMetadata>(
      `/log/${fromCorrelation}`,
      accessToken,
    );

    return (await findRootLog(parentLog?.fromCorrelation, accessToken)) || parentLog;
  } catch (error) {
    console.error(`Error fetching parent log for correlation ${fromCorrelation}:`, error);
    return;
  }
});
