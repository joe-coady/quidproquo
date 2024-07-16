import { apiRequestGet } from '../../logic';

export async function getFederationManifestUrl(apiBaseUrl: string, accessToken?: string): Promise<string> {
  const manifestUrl = await apiRequestGet<string>(`/admin/fmurl`, apiBaseUrl, accessToken);

  return manifestUrl;
}

export async function getFederationManifest(apiBaseUrl: string, url: string): Promise<{ id: string }> {
  const manifestUrlJson = await apiRequestGet<{ id: string }>(url, apiBaseUrl);

  return manifestUrlJson;
}
