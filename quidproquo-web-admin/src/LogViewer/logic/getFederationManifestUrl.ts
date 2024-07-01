import { apiRequestGet } from '../../logic';

export async function getFederationManifestUrl(accessToken?: string): Promise<string> {
  const manifestUrl = await apiRequestGet<string>(`/admin/fmurl`, accessToken);

  return manifestUrl;
}
