import { describe, expect, it } from 'vitest';

import { QPQAwsConfigSettingType } from '../QPQConfig';
import { AwsKmsKeyTargetType, defineAwsKmsKey } from './awsKmsKey';

describe('defineAwsKmsKey', () => {
  it('builds a kms key setting keyed by keyname', () => {
    const owner = { name: 'files', module: 'media' };

    expect(defineAwsKmsKey('filesKey', 'arn:aws:kms:key', AwsKmsKeyTargetType.storageDrive, owner)).toEqual({
      configSettingType: QPQAwsConfigSettingType.awsKmsKey,
      uniqueKey: 'filesKey',
      keyname: 'filesKey',
      arn: 'arn:aws:kms:key',
      type: AwsKmsKeyTargetType.storageDrive,
      kmsOwner: owner,
    });
  });
});
