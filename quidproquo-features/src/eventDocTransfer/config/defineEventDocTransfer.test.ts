import { QPQCoreConfigSettingType } from 'quidproquo-core';
import { QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { describe, expect, it } from 'vitest';

import { EVENT_DOC_USER_DIRECTORY_GLOBAL } from '../../eventDoc/constants/eventDocGlobalNames';
import { EVENT_DOC_TRANSFER_COLLECTIONS_GLOBAL, EVENT_DOC_TRANSFER_SERVICE_GLOBAL } from '../constants';
import { defineEventDocTransfer } from './defineEventDocTransfer';

const collections = [{ storeName: 'templates', type: 'template', referenceResolver: 'templateReferences' }];

// The config is a flat array of settings; routes are the ones carrying a runtime with globals.
const routeGlobals = (config: unknown[]): Record<string, unknown>[] =>
  config
    .flat(Infinity)
    .filter((setting): setting is { configSettingType: string; runtime: { globals?: Record<string, unknown> } } => {
      const candidate = setting as { configSettingType?: string };
      return candidate.configSettingType === QPQWebServerConfigSettingType.Route;
    })
    .map((setting) => setting.runtime.globals ?? {});

describe('defineEventDocTransfer', () => {
  it('gives every route the registry it needs to resolve a collection', () => {
    const globals = routeGlobals(defineEventDocTransfer({ service: 'template', collections }));

    expect(globals).not.toHaveLength(0);
    expect(globals.every((entry) => entry[EVENT_DOC_TRANSFER_SERVICE_GLOBAL] === 'template')).toBe(true);
    expect(globals.every((entry) => Array.isArray(entry[EVENT_DOC_TRANSFER_COLLECTIONS_GLOBAL]))).toBe(true);
  });

  it('emits the user directory global when the routes are authed', () => {
    // Regression: the tenant scope resolver runs on every transfer request and reaches
    // askEventDocResolveUserId, which reads this global. Without it the first call fails with
    // "Global config eventDocUserDirectory not found" - the same contract defineEventDocRoutes,
    // defineTenantRoutes and defineEventDocAi all honour.
    const config = defineEventDocTransfer({
      service: 'template',
      collections,
      routeAuthSettings: { userDirectoryName: 'docgen-users' },
    });

    expect(routeGlobals(config).every((entry) => entry[EVENT_DOC_USER_DIRECTORY_GLOBAL] === 'docgen-users')).toBe(true);
  });

  it('leaves the directory global unset when the routes are open', () => {
    const globals = routeGlobals(defineEventDocTransfer({ service: 'template', collections }));

    expect(globals.every((entry) => !(EVENT_DOC_USER_DIRECTORY_GLOBAL in entry))).toBe(true);
  });

  it('provisions the staging drive', () => {
    const config = defineEventDocTransfer({ service: 'template', collections }).flat(Infinity) as { configSettingType: string }[];

    expect(config.some((setting) => setting.configSettingType === QPQCoreConfigSettingType.storageDrive)).toBe(true);
  });
});
