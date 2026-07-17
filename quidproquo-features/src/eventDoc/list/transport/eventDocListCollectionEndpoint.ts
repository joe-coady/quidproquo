// The generic collection route defineEventDocRoutes registers on the backend:
// GET lists the collection's summaries, POST creates a new doc.
export const eventDocListCollectionEndpoint = (basePath: string): string => `/v1${basePath}`;
