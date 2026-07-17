import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';

// Built from the slot's identity so the transport is collection-agnostic; this is the
// path shape defineEventDocRoutes registers for asset uploads on the backend.
export const eventDocWorkspaceAssetsEndpoint = ({ basePath, id }: EventDocWorkspaceDocumentIdentity): string => `/v1${basePath}/${id}/assets`;
