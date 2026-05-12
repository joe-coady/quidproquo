import { QPQConfigSetting } from 'quidproquo-core';

import { QPQAwsConfigSettingType } from '../QPQConfig';

export enum AwsKmsKeyTargetType {
  storageDrive = 'storageDrive',
  keyValueStore = 'keyValueStore',
}

export type AwsKmsKeyOwner = {
  name: string;
  module: string;
};

export interface AwsKmsKeyQPQConfigSetting extends QPQConfigSetting {
  keyname: string;
  arn: string;
  type: AwsKmsKeyTargetType;
  kmsOwner: AwsKmsKeyOwner;
}

export const defineAwsKmsKey = (
  keyname: string,
  arn: string,
  type: AwsKmsKeyTargetType,
  owner: AwsKmsKeyOwner,
): AwsKmsKeyQPQConfigSetting => ({
  configSettingType: QPQAwsConfigSettingType.awsKmsKey,
  uniqueKey: keyname,

  keyname,
  arn,
  type,
  kmsOwner: owner,
});
