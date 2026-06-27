import { buildTestQpqConfig, defineKeyValueStore, defineStorageDrive } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { AwsAlarmLambdaMetricName, AwsAlarmNamespace, AwsAlarmOperator, AwsAlarmPeriod, AwsAlarmStatistic, defineAwsAlarm } from '../config/settings/awsAlarm';
import { defineAwsDyanmoOverrideForKvs } from '../config/settings/awsDyanmoOverrideForKvs';
import { AwsKmsKeyTargetType, defineAwsKmsKey } from '../config/settings/awsKmsKey';
import { defineBootstrapCloudTrail } from '../config/settings/cloudTrail';
import { defineDomainCertificate } from '../config/settings/domainCertificate';
import { defineBootstrapAwsOrganization } from '../config/settings/organizations';
import { defineAwsServiceAccountInfo } from '../config/settings/serviceAccountInfo';
import { ServiceAccountInfo } from '../types';
import {
  getApplicationModuleDeployAccountId,
  getApplicationModuleDeployRegion,
  getAwsAccountIds,
  getAwsBootstrapOrganizationConfigs,
  getAwsKmsKeyForKeyValueStore,
  getAwsKmsKeyForStorageDrive,
  getAwsKmsKeys,
  getAwsServiceAccountInfoByDeploymentInfo,
  getAwsServiceAccountInfoConfig,
  getAwsServiceAccountInfos,
  getBootstrapCloudTrailConfigs,
  getDomainCertificateArnSsmParameterName,
  getDomainCertificateConfigs,
  getDynamoTableNameOverrride,
  getLocalServiceAccountInfo,
  getOwnedAwsAlarmConfigs,
  isLambdaWarmingDisabled,
  isReservedConcurrencyDisabled,
  isTracingDisabled,
  resolveAwsServiceAccountInfo,
} from './configUtils';

const alarmSettings = {
  namespace: AwsAlarmNamespace.Lambda,
  metricName: AwsAlarmLambdaMetricName.Errors,
  statistic: AwsAlarmStatistic.Sum,
  period: AwsAlarmPeriod.FiveMinutes,
  operator: AwsAlarmOperator.GreaterThanThreshold,
  threshold: 1,
  datapointsToAlarm: 1,
  evaluationPeriodsToAlarm: 1,
  onAlarm: {},
} as const;

describe('getAwsServiceAccountInfoConfig', () => {
  it('returns the single service account info setting', () => {
    const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'us-east-1')]);

    expect(getAwsServiceAccountInfoConfig(config).deployAccountId).toBe('111');
  });

  it('throws when no service account info is defined', () => {
    expect(() => getAwsServiceAccountInfoConfig(buildTestQpqConfig())).toThrow();
  });

  it('throws when more than one service account info is defined', () => {
    const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'us-east-1'), defineAwsServiceAccountInfo('222', 'us-west-2')]);

    expect(() => getAwsServiceAccountInfoConfig(config)).toThrow();
  });
});

describe('getAwsBootstrapOrganizationConfigs', () => {
  it('returns the defined organization settings', () => {
    const config = buildTestQpqConfig([defineBootstrapAwsOrganization('ou-root', 'aws@example.com', 'acme', ['dev'])]);

    expect(getAwsBootstrapOrganizationConfigs(config)).toHaveLength(1);
  });

  it('returns an empty list when none are defined', () => {
    expect(getAwsBootstrapOrganizationConfigs(buildTestQpqConfig())).toEqual([]);
  });
});

describe('getBootstrapCloudTrailConfigs', () => {
  it('returns the defined cloud trail settings', () => {
    const config = buildTestQpqConfig([defineBootstrapCloudTrail('trail')]);

    expect(getBootstrapCloudTrailConfigs(config)).toHaveLength(1);
  });
});

describe('getAwsServiceAccountInfos', () => {
  it('appends the local service account info and dedupes identical service entries', () => {
    const remote: ServiceAccountInfo = { moduleName: 'auth', awsAccountId: '999', awsRegion: 'us-west-2' };
    const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'us-east-1', [remote, { ...remote }])]);

    const infos = getAwsServiceAccountInfos(config);

    expect(infos).toHaveLength(2);
    expect(infos.some((i) => i.moduleName === 'auth')).toBe(true);
    expect(infos.some((i) => i.moduleName === 'test-module')).toBe(true);
  });
});

describe('getLocalServiceAccountInfo', () => {
  it('derives the local service from the app module and the deploy account', () => {
    const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'us-east-1')]);

    expect(getLocalServiceAccountInfo(config)).toEqual({
      moduleName: 'test-module',
      applicationName: 'test-app',
      environment: 'development',
      feature: undefined,
      awsAccountId: '111',
      awsRegion: 'us-east-1',
    });
  });
});

describe('getAwsAccountIds', () => {
  it('returns the unique set of account ids across services', () => {
    const config = buildTestQpqConfig([
      defineAwsServiceAccountInfo('111', 'us-east-1', [
        { moduleName: 'a', awsAccountId: '111', awsRegion: 'us-east-1' },
        { moduleName: 'b', awsAccountId: '222', awsRegion: 'us-east-1' },
      ]),
    ]);

    expect(getAwsAccountIds(config).sort()).toEqual(['111', '222']);
  });
});

describe('deploy account and region selectors', () => {
  const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'eu-west-1')]);

  it('reads the deploy region', () => {
    expect(getApplicationModuleDeployRegion(config)).toBe('eu-west-1');
  });

  it('reads the deploy account id', () => {
    expect(getApplicationModuleDeployAccountId(config)).toBe('111');
  });
});

describe('disable flag selectors', () => {
  const config = buildTestQpqConfig([
    defineAwsServiceAccountInfo('111', 'us-east-1', [], {
      disableLambdaWarming: true,
      disableReservedConcurrency: true,
      disableTracing: true,
    }),
  ]);

  it('reads disableLambdaWarming', () => {
    expect(isLambdaWarmingDisabled(config)).toBe(true);
  });

  it('reads disableReservedConcurrency', () => {
    expect(isReservedConcurrencyDisabled(config)).toBe(true);
  });

  it('reads disableTracing', () => {
    expect(isTracingDisabled(config)).toBe(true);
  });
});

describe('resolveAwsServiceAccountInfo', () => {
  it('resolves the local service when no cross module owner is given', () => {
    const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'us-east-1')]);

    expect(resolveAwsServiceAccountInfo(config).moduleName).toBe('test-module');
  });
});

describe('getAwsServiceAccountInfoByDeploymentInfo', () => {
  it('prefers the more specific match when weights tie', () => {
    const exact: ServiceAccountInfo = {
      moduleName: 'mod1',
      applicationName: 'app1',
      environment: 'env1',
      feature: 'feat1',
      awsAccountId: 'exact',
      awsRegion: 'r1',
    };
    const broad: ServiceAccountInfo = { moduleName: 'mod1', awsAccountId: 'broad', awsRegion: 'r2' };
    const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'us-east-1', [exact, broad])]);

    expect(getAwsServiceAccountInfoByDeploymentInfo(config, 'mod1', 'env1', 'feat1', 'app1').awsAccountId).toBe('exact');
  });

  it('throws when nothing matches the target', () => {
    const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'us-east-1')], { feature: 'feat' });

    expect(() => getAwsServiceAccountInfoByDeploymentInfo(config, 'nope', 'nope', 'nope', 'nope')).toThrow();
  });
});

describe('getOwnedAwsAlarmConfigs', () => {
  it('returns alarms owned by the local module', () => {
    const config = buildTestQpqConfig([defineAwsAlarm('errors', alarmSettings)]);

    expect(getOwnedAwsAlarmConfigs(config)).toHaveLength(1);
  });
});

describe('getDomainCertificateConfigs', () => {
  it('returns the defined certificate settings', () => {
    const config = buildTestQpqConfig([defineDomainCertificate('example.com', 'us-east-1', ['api'])]);

    expect(getDomainCertificateConfigs(config)).toHaveLength(1);
  });
});

describe('getDomainCertificateArnSsmParameterName', () => {
  it('builds an ssm parameter name with the dots in the root domain sanitized to dashes', () => {
    expect(getDomainCertificateArnSsmParameterName('us-east-1', 'sub.example.com')).toBe('/qpq/domain/certificate-arn/us-east-1/sub-example-com');
  });
});

describe('getAwsKmsKeys', () => {
  it('returns the defined kms key settings', () => {
    const config = buildTestQpqConfig([defineAwsKmsKey('k', 'arn', AwsKmsKeyTargetType.storageDrive, { name: 'files', module: 'test-module' })]);

    expect(getAwsKmsKeys(config)).toHaveLength(1);
  });
});

describe('getAwsKmsKeyForStorageDrive', () => {
  it('matches a key by storage drive name and owning module', () => {
    const config = buildTestQpqConfig([
      defineStorageDrive('files'),
      defineAwsKmsKey('filesKey', 'arn', AwsKmsKeyTargetType.storageDrive, { name: 'files', module: 'test-module' }),
    ]);

    const storageDrive = defineStorageDrive('files');

    expect(getAwsKmsKeyForStorageDrive(config, storageDrive)?.keyname).toBe('filesKey');
  });

  it('returns undefined when no key matches', () => {
    const config = buildTestQpqConfig([defineStorageDrive('files')]);

    expect(getAwsKmsKeyForStorageDrive(config, defineStorageDrive('files'))).toBeUndefined();
  });
});

describe('getAwsKmsKeyForKeyValueStore', () => {
  it('matches a key by key value store name and owning module', () => {
    const config = buildTestQpqConfig([
      defineKeyValueStore('users', 'id'),
      defineAwsKmsKey('usersKey', 'arn', AwsKmsKeyTargetType.keyValueStore, { name: 'users', module: 'test-module' }),
    ]);

    expect(getAwsKmsKeyForKeyValueStore(config, defineKeyValueStore('users', 'id'))?.keyname).toBe('usersKey');
  });

  it('returns undefined when no key matches', () => {
    const config = buildTestQpqConfig([defineKeyValueStore('users', 'id')]);

    expect(getAwsKmsKeyForKeyValueStore(config, defineKeyValueStore('users', 'id'))).toBeUndefined();
  });
});

describe('getDynamoTableNameOverrride', () => {
  it('returns the override table name when the kvs resource matches', () => {
    const config = buildTestQpqConfig([
      defineKeyValueStore('users', 'id'),
      defineAwsDyanmoOverrideForKvs(
        'override',
        { keyValueStoreName: 'users', module: 'test-module', application: 'test-app', environment: 'development', feature: '' },
        'users-table',
      ),
    ]);

    expect(getDynamoTableNameOverrride('users', config)).toBe('users-table');
  });

  it('returns an empty string when no override matches', () => {
    const config = buildTestQpqConfig([defineKeyValueStore('users', 'id')]);

    expect(getDynamoTableNameOverrride('users', config)).toBe('');
  });
});
