// @vitest-environment jsdom
import { buildTestQpqConfig, ConfigActionType, ConfigSetParameterErrorTypeEnum, ErrorTypeEnum, noopDynamicModuleLoader } from 'quidproquo-core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getConfigSetParameterActionProcessor } from './getConfigSetParameterActionProcessor';

const getProcessor = async () => {
  const processors = await getConfigSetParameterActionProcessor(buildTestQpqConfig(), noopDynamicModuleLoader);
  return processors[ConfigActionType.SetParameter] as (p: any, ...rest: any[]) => Promise<any>;
};

describe('getConfigSetParameterActionProcessor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes the value to local storage and returns success', async () => {
    const processor = await getProcessor();

    const [, error] = await processor({ parameterName: 'token', parameterValue: 'abc' });

    expect(error).toBeUndefined();
    expect(localStorage.getItem('token')).toBe('abc');
  });

  it('maps a QuotaExceededError to the QuotaExceeded error type', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const quotaError = new Error('full');
      quotaError.name = 'QuotaExceededError';
      throw quotaError;
    });
    const processor = await getProcessor();

    const [, error] = await processor({ parameterName: 'token', parameterValue: 'abc' });

    expect(error?.errorType).toBe(ConfigSetParameterErrorTypeEnum.QuotaExceeded);
  });

  it('maps an unrecognised error to a generic error', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('boom');
    });
    const processor = await getProcessor();

    const [, error] = await processor({ parameterName: 'token', parameterValue: 'abc' });

    expect(error?.errorType).toBe(ErrorTypeEnum.GenericError);
  });
});
