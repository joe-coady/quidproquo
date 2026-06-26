import { describe, expect, it } from 'vitest';

import { QPQCoreConfigSettingType } from '../QPQConfig';
import { defineStorageDrive } from './storageDrive';

describe('defineStorageDrive', () => {
  it('builds a StorageDrive setting with the given name and defaults', () => {
    expect(defineStorageDrive('Uploads')).toEqual({
      configSettingType: QPQCoreConfigSettingType.storageDrive,
      uniqueKey: 'Uploads',
      storageDrive: 'Uploads',
      copyPath: undefined,
      global: false,
      onEvent: undefined,
      lifecycleRules: undefined,
      encryption: false,
      owner: undefined,
    });
  });

  it('defaults global and encryption to false', () => {
    const setting = defineStorageDrive('Uploads');

    expect(setting.global).toBe(false);
    expect(setting.encryption).toBe(false);
  });

  it('applies the supplied options', () => {
    const setting = defineStorageDrive('Uploads', { global: true, encryption: true, copyPath: './assets' });

    expect(setting.global).toBe(true);
    expect(setting.encryption).toBe(true);
    expect(setting.copyPath).toBe('./assets');
  });
});
