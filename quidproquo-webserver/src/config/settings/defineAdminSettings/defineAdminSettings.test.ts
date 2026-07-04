import { GlobalQPQConfigSetting, QPQConfig, QPQConfigSetting, QPQCoreConfigSettingType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { defineAdminSettings } from './defineAdminSettings';

const findOwnedGlobal = (config: QPQConfig, service: string, key: string): unknown => {
  const serviceSettings = config.find((s) => (s as QPQConfigSetting).configSettingType === QPQCoreConfigSettingType.serviceSettings) as unknown as {
    settingsByService: Record<string, QPQConfigSetting[]>;
  };

  const global = serviceSettings.settingsByService[service].find(
    (s) => s.configSettingType === QPQCoreConfigSettingType.global && (s as GlobalQPQConfigSetting<unknown>).key === key,
  ) as GlobalQPQConfigSetting<unknown> | undefined;

  return global?.value;
};

describe('defineAdminSettings', () => {
  it('leaves the log retention undefined when no retention is configured', () => {
    const config = defineAdminSettings('log', 'example.com');

    expect(findOwnedGlobal(config, 'log', 'qpq-log-retention-days')).toBeUndefined();
  });

  it('keeps the configured retention when no cold storage is set', () => {
    const config = defineAdminSettings('log', 'example.com', { logRetentionDays: 30 });

    expect(findOwnedGlobal(config, 'log', 'qpq-log-retention-days')).toBe(30);
  });

  it('pads retention by 180 days past the cold-storage window', () => {
    const config = defineAdminSettings('log', 'example.com', { logRetentionDays: 30, coldStorageAfterDays: 10 });

    expect(findOwnedGlobal(config, 'log', 'qpq-log-retention-days')).toBe(190);
  });

  it('exposes the configured service names to the admin', () => {
    const config = defineAdminSettings('log', 'example.com', { services: ['billing', 'auth'] });

    expect(findOwnedGlobal(config, 'log', 'qpq-serviceNames')).toEqual(['billing', 'auth']);
  });
});
