import { describe, expect, it } from 'vitest';

import { QPQWebServerConfigSettingType } from '../QPQConfig';
import { defineOpenApi } from './openApi';

describe('defineOpenApi', () => {
  it('builds an OpenApi setting keyed by the spec path', () => {
    expect(defineOpenApi('./openapi.yaml')).toEqual({
      configSettingType: QPQWebServerConfigSettingType.OpenApi,
      uniqueKey: './openapi.yaml',
      openApiSpecPath: './openapi.yaml',
    });
  });
});
