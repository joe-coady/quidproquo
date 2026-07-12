// SET_BRAND payload: partial branding update folded onto the tenant document.
export type TenantSetBrandData = {
  brandColors?: Record<string, string>;
  logoUrl?: string;
};
