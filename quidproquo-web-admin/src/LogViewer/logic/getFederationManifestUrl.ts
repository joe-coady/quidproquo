import { apiRequestGet } from '../../logic';

export async function getFederationManifestUrl(accessToken?: string): Promise<string> {
  const manifestUrl = await apiRequestGet<string>(`/admin/fmurl`, accessToken);

  return manifestUrl;
}

export async function getFederationManifest(url: string): Promise<{ id: string }> {
  const manifestUrlJson = await apiRequestGet<{ id: string }>(url);

  return manifestUrlJson;
}
