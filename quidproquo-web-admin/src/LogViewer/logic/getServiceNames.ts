import { StoryResultMetadataWithChildren } from 'quidproquo-core';
import { apiRequestGet, externalRequestGet } from '../../logic';

export const getServiceNames = async function findRootLog(accessToken?: string): Promise<string[]> {
  const serviceNames = await apiRequestGet<string[]>(`/admin/services`, accessToken);

  return serviceNames;
};
