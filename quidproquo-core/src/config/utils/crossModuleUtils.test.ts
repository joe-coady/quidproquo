import { describe, expect, it } from 'vitest';

import { convertCrossModuleOwnerToGenericResourceNameOverride } from './crossModuleUtils';

describe('convertCrossModuleOwnerToGenericResourceNameOverride', () => {
  it('returns undefined when no owner is given', () => {
    expect(convertCrossModuleOwnerToGenericResourceNameOverride(undefined)).toBeUndefined();
  });

  it('copies the non-scope key value into resourceNameOverride', () => {
    expect(convertCrossModuleOwnerToGenericResourceNameOverride({ module: 'other', queueName: 'Jobs' } as any)).toEqual({
      module: 'other',
      queueName: 'Jobs',
      resourceNameOverride: 'Jobs',
    });
  });

  it('ignores scope keys when picking the resource name', () => {
    const owner = { application: 'app', module: 'mod', feature: 'feat', environment: 'env', secretName: 'apiKey' };

    expect(convertCrossModuleOwnerToGenericResourceNameOverride(owner as any)?.resourceNameOverride).toBe('apiKey');
  });
});
