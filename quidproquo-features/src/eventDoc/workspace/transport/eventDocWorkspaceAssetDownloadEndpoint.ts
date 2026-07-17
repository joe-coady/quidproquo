import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';

// Built from the slot's identity so the transport is collection-agnostic; this is the
// path shape defineEventDocRoutes registers for asset downloads on the backend.
export const eventDocWorkspaceAssetDownloadEndpoint = ({ basePath, id }: EventDocWorkspaceDocumentIdentity, assetId: string): string =>
  `/v1${basePath}/${id}/assets/${assetId}`;
