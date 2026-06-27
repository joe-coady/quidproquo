import { captureRequester } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { OpenApiSpecActionType } from './OpenApiSpecActionType';
import { askGetOpenApiSpec } from './OpenApiSpecGetOpenApiSpecActionRequester';

describe('askGetOpenApiSpec', () => {
  it('yields a GetOpenApiSpec action with no payload', () => {
    const { action } = captureRequester(askGetOpenApiSpec());

    expect(action).toEqual({ type: OpenApiSpecActionType.GetOpenApiSpec });
  });
});
