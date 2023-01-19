import { QPQCoreConfigSettingType } from 'quidproquo-core';
import { QpqCoreSecretConstruct } from './constructs/QpqCoreSecretConstruct';

export default {
  [QPQCoreConfigSettingType.secret]: QpqCoreSecretConstruct,
};
