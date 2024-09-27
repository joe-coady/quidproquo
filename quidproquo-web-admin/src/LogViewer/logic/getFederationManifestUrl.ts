import { apiRequestGet } from '../../logic';

export async function getFederationManifest(apiBaseUrl: string, url: string): Promise<{ id: string }> {
  const manifestUrlJson = await apiRequestGet<{ id: string }>(url, apiBaseUrl);

  return manifestUrlJson;
}
