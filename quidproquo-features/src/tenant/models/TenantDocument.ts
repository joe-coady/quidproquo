import { EventDocAssetRef, EventDocDocument } from '../../eventDoc/models';
import { TenantBrandColors } from './TenantBrandColors';

// The folded tenant document: universal eventDoc fields plus the branding slice.
// Branding is optional — a tenant that never set it folds to no brandColors/logo,
// and the site falls back to its default pair.
export type TenantDocument = EventDocDocument & {
  brandColors?: TenantBrandColors;
  logo?: EventDocAssetRef;
};
