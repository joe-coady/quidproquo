import { StoryResultMetadata } from 'quidproquo-core';
import { cache } from '../../logic/cache';

import { fineLogDirectChildren } from './findLogDirectChildren';

export const createHierarchy = cache(
  async (
    rootStoryResultMetadata: StoryResultMetadata,
    accessToken?: string,
  ): Promise<StoryResultMetadataWithChildren> => {
    const childrenLogs: StoryResultMetadata[] = await fineLogDirectChildren(
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
