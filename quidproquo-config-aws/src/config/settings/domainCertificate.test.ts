import { describe, expect, it } from 'vitest';

import { QPQAwsConfigSettingType } from '../QPQConfig';
import { defineDomainCertificate } from './domainCertificate';

describe('defineDomainCertificate', () => {
  it('builds a certificate setting keyed by rootDomain and region, defaulting includeApex to false', () => {
    expect(defineDomainCertificate('example.com', 'us-east-1', ['api'])).toEqual({
      configSettingType: QPQAwsConfigSettingType.awsDomainCertificate,
      uniqueKey: 'example.com::us-east-1',
      rootDomain: 'example.com',
      region: 'us-east-1',
      subdomains: ['api'],
      includeApex: false,
    });
  });

  it('uses the supplied includeApex option', () => {
    expect(defineDomainCertificate('example.com', 'us-east-1', [], { includeApex: true }).includeApex).toBe(true);
  });
});
