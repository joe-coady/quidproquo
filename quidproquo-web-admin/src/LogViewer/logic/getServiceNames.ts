import { apiRequestGet } from '../../logic';

export const getServiceNames = async function findRootLog(apiBaseUrl: string, accessToken?: string): Promise<string[]> {
  const serviceNames = await apiRequestGet<string[]>(`/admin/services`, apiBaseUrl, accessToken);

  return serviceNames;
};
