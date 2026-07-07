import { buildTestQpqConfig, defineStorageDrive } from 'quidproquo-core';

import { describe, expect, it, vi } from 'vitest';

import { getConfigRuntimeResourceNameFromConfigWithServiceOverride } from '../../../../awsNamingUtils';
import { resolveStorageDriveBucketName } from './resolveStorageDriveBucketName';

vi.mock('../../../../awsNamingUtils', () => ({
  getConfigRuntimeResourceNameFromConfigWithServiceOverride: vi.fn(() => 'resolved-bucket'),
}));

describe('resolveStorageDriveBucketName', () => {
  it('resolves the runtime bucket name for a known drive', () => {
    const config = buildTestQpqConfig([defineStorageDrive('assets')]);

    const result = resolveStorageDriveBucketName('assets', config);

    expect(result).toBe('resolved-bucket');
    expect(getConfigRuntimeResourceNameFromConfigWithServiceOverride).toHaveBeenCalledWith('assets', config, undefined);
  });

  it('throws when the storage drive config is missing', () => {
    const config = buildTestQpqConfig();

    expect(() => resolveStorageDriveBucketName('ghost', config)).toThrow('Could not find storage drive config for [ghost]');
  });
});
