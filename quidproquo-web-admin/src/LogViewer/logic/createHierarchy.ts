import { cache } from '../../logic/cache';
import { StoryResultMetadataLog } from '../../types';
import { fineLogDirectChildren } from './findLogDirectChildren';

export type StoryResultMetadataLogWithChildren = StoryResultMetadataLog & {
  children: StoryResultMetadataLogWithChildren[];
};

export const createHierarchy = cache(
  async (
    rootStoryResultMetadata: StoryResultMetadataLog,
    accessToken?: string,
  ): Promise<StoryResultMetadataLogWithChildren> => {
    const childrenLogs: StoryResultMetadataLog[] = await fineLogDirectChildren(
      rootStoryResultMetadata.correlation,
      accessToken,
    );

    const children = await Promise.all(
      childrenLogs
        .sort((a, b) => {
          return a.startedAt < b.startedAt ? -1 : 1;
        })
        .map((child) => createHierarchy(child, accessToken)),
    );

    return {
      ...rootStoryResultMetadata,
      children,
    };
  },
);
