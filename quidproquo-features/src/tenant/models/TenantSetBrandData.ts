import { TenantBrandColors } from './TenantBrandColors';

// SET_BRAND payload: partial branding update folded onto the tenant document.
// brandColors is a whole-or-nothing pair (both primary and secondary), replaced
// as a unit when present.
export type TenantSetBrandData = {
  brandColors?: TenantBrandColors;
  logoUrl?: string;
};
