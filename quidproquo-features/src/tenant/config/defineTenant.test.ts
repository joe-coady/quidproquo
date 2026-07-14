import { QPQCoreConfigSettingType } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { TENANT_CONNECTION_SCOPE_RESOLVER_FN, TENANT_SCOPE_RESOLVER_FN, USER_TENANT_LINKS_STORE } from '../constants/tenantStoreNames';
import { defineTenant } from './defineTenant';

const config = defineTenant({
  owner: { module: 'owner-svc' },
  basePath: '/tenants',
  routeAuthSettings: { userDirectoryName: 'users' },
});

describe('defineTenant', () => {
  it('always registers the request + connection scope resolver inline functions', () => {
    const inlineFnNames = config
      .filter((s) => (s as { configSettingType: string }).configSettingType === QPQCoreConfigSettingType.inlineFunction)
      .map((s) => (s as { functionName: string }).functionName);

    expect(inlineFnNames).toEqual(expect.arrayContaining([TENANT_SCOPE_RESOLVER_FN, TENANT_CONNECTION_SCOPE_RESOLVER_FN]));
  });

  it('declares the membership table owned by the owner (a cross-module ref elsewhere)', () => {
    const membershipStore = config.find(
      (s) =>
        (s as { configSettingType: string }).configSettingType === QPQCoreConfigSettingType.keyValueStore &&
        (s as { uniqueKey: string }).uniqueKey.includes(USER_TENANT_LINKS_STORE),
    ) as { owner?: unknown };

    // The owner field alone decides owned-vs-foreign at deploy - no service-gating.
    expect(membershipStore.owner).toEqual({ module: 'owner-svc' });
  });

  it('gates the rest of the registry to the owner service', () => {
    const serviceSettings = config.find(
      (s) => (s as { configSettingType: string }).configSettingType === QPQCoreConfigSettingType.serviceSettings,
    ) as { settingsByService: Record<string, unknown[]> };

    expect(Object.keys(serviceSettings.settingsByService)).toEqual(['owner-svc']);
  });

  it('scopes the tenant collection itself with the standard tenant scope resolver', () => {
    const serviceSettings = config.find(
      (s) => (s as { configSettingType: string }).configSettingType === QPQCoreConfigSettingType.serviceSettings,
    ) as { settingsByService: Record<string, unknown[]> };

    // The standard resolver is threaded into the tenant collection's own route
    // globals (the {basePath}/docs CRUD and the {basePath} custom routes) -
    // without it every authenticated user could read and mutate every tenant's
    // doc. The tenant collection is an ordinary tenanted collection.
    const ownerSettings = JSON.stringify(serviceSettings.settingsByService['owner-svc']);
    const occurrences = ownerSettings.split(TENANT_SCOPE_RESOLVER_FN).length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});
