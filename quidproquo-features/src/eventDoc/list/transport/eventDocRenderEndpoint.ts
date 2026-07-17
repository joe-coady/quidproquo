// A document's server-rendered output (the generic GET {basePath}/{id}/render route).
export const eventDocRenderEndpoint = (basePath: string, id: string): string => `/v1${basePath}/${id}/render`;
