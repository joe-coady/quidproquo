import { captureRequester } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { askGetOpenApiSpec } from './askGetOpenApiSpec';
import { OpenApiSpecActionType } from './OpenApiSpecActionType';

describe('askGetOpenApiSpec', () => {
  it('yields a GetOpenApiSpec action with no payload', () => {
    const { action } = captureRequester(askGetOpenApiSpec());

    expect(action).toEqual({ type: OpenApiSpecActionType.GetOpenApiSpec });
  });
});
