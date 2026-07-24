import { describe, expect, it } from 'vitest';

import { QPQAwsConfigSettingType } from '../QPQConfig';
import { defineEmailSenderAllowList } from './emailSenderAllowList';

describe('defineEmailSenderAllowList', () => {
  it('builds an allow-list setting keyed by the root domain', () => {
    expect(defineEmailSenderAllowList('example.com', ['joe@external.com', 'test@external.com'])).toEqual({
      configSettingType: QPQAwsConfigSettingType.awsEmailSenderAllowList,
      uniqueKey: 'example.com',
      rootDomain: 'example.com',
      allowedEmailAddresses: ['joe@external.com', 'test@external.com'],
    });
  });
});
