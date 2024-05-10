import { StoryResultMetadataWithChildren } from 'quidproquo-core';
import { apiRequestGet, externalRequestGet } from '../../logic';

export const getLogHierarchy = async function findRootLog(
  correlation?: string,
  accessToken?: string,
): Promise<StoryResultMetadataWithChildren | undefined> {
  if (!correlation) {
    return;
  }

  const hierarchyUrl = await apiRequestGet<{ url: string }>(
    `/log/${correlation}/hierarchies`,
    accessToken,
  );

  if (hierarchyUrl.url) {
    const reportJson = await externalRequestGet<StoryResultMetadataWithChildren>(hierarchyUrl.url);

    return reportJson;
  }

  return undefined;
};
