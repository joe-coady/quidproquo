import { describe, expect, it } from 'vitest';

import { QPQWebServerConfigSettingType } from '../QPQConfig';
import { defineDns } from './dns';

describe('defineDns', () => {
  it('builds a Dns setting keyed by the dns base', () => {
    expect(defineDns('example.com')).toEqual({
      configSettingType: QPQWebServerConfigSettingType.Dns,
      uniqueKey: 'example.com',
      dnsBase: 'example.com',
    });
  });
});
