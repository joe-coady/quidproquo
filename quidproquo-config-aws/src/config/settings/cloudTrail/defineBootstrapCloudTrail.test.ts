import { describe, expect, it } from 'vitest';

import { QPQAwsConfigSettingType } from '../../QPQConfig';
import { defineBootstrapCloudTrail } from './defineBootstrapCloudTrail';

describe('defineBootstrapCloudTrail', () => {
  it('builds a cloud trail setting keyed by name with undefined options when omitted', () => {
    expect(defineBootstrapCloudTrail('trail')).toEqual({
      configSettingType: QPQAwsConfigSettingType.bootstrapCloudTrail,
      uniqueKey: 'trail',
      name: 'trail',
      retentionDays: undefined,
      enableLogFileValidation: undefined,
      multiRegion: undefined,
      includeGlobalServiceEvents: undefined,
      cloudWatchLogs: undefined,
    });
  });

  it('carries through the supplied options', () => {
    expect(
      defineBootstrapCloudTrail('trail', {
        retentionDays: 30,
        enableLogFileValidation: true,
        multiRegion: true,
        includeGlobalServiceEvents: false,
        cloudWatchLogs: { retentionDays: 7 },
      }),
    ).toEqual({
      configSettingType: QPQAwsConfigSettingType.bootstrapCloudTrail,
      uniqueKey: 'trail',
      name: 'trail',
      retentionDays: 30,
      enableLogFileValidation: true,
      multiRegion: true,
      includeGlobalServiceEvents: false,
      cloudWatchLogs: { retentionDays: 7 },
    });
  });
});
