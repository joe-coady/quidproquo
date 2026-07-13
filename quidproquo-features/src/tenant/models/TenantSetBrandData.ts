import { EventDocAssetRef } from '../../eventDoc/models';
import { TenantBrandColors } from './TenantBrandColors';

// SET_BRAND payload: partial branding update folded onto the tenant document.
// brandColors is a whole-or-nothing pair (both primary and secondary), replaced
// as a unit when present. logo is an uploaded asset ref (like every other
// editor's blobs) - resolved to a URL at read time, never stored as a URL.
export type TenantSetBrandData = {
  brandColors?: TenantBrandColors;
  logo?: EventDocAssetRef;
};
