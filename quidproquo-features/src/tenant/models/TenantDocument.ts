import { EventDocDocument } from '../../eventDoc/models';

// The folded tenant document: universal eventDoc fields plus the branding slice.
export type TenantDocument = EventDocDocument & {
  brandColors: Record<string, string>;
  logoUrl?: string;
};
