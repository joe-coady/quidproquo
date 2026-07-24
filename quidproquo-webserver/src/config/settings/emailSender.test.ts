import { describe, expect, it } from 'vitest';

import { QPQWebServerConfigSettingType } from '../QPQConfig';
import { defineEmailSender } from './emailSender';

describe('defineEmailSender', () => {
  it('builds an EmailSender setting keyed by the root domain', () => {
    expect(defineEmailSender('example.com')).toEqual({
      configSettingType: QPQWebServerConfigSettingType.EmailSender,
      uniqueKey: 'example.com',
      rootDomain: 'example.com',
    });
  });
});
