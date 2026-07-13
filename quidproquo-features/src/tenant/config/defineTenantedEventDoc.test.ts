import { describe, expect, it } from 'vitest';

import { TENANT_SCOPE_RESOLVER_FN } from '../constants/tenantStoreNames';
import { defineTenantedEventDoc } from './defineTenantedEventDoc';

describe('defineTenantedEventDoc', () => {
  it('pre-wires the tenant scope resolver onto the event doc', () => {
    const config = defineTenantedEventDoc({
      storeName: 'docs',
      type: 'doc',
      basePath: '/docs',
    });

    // The resolver name is threaded into the collection's route globals.
    expect(JSON.stringify(config)).toContain(TENANT_SCOPE_RESOLVER_FN);
  });
});
