// The transfer routes defineEventDocTransfer registers, as the frontend addresses them. `/v1` is
// defineVersionedRoute's prefix; keep this the only place the shape is written down.
export const eventDocTransferEndpoint = (action: 'manifest' | 'export' | 'upload' | 'plan' | 'import', version = 1): string =>
  `/v${version}/transfer/${action}`;
