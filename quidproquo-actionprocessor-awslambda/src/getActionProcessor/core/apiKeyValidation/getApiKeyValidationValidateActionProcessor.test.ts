import { defineAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { buildTestQpqConfig } from 'quidproquo-core';
import { ApiKeyValidationActionType } from 'quidproquo-webserver';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getApiKeys } from '../../../logic/apiGateway/getApiKeys';
import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getApiKeyValidationValidateActionProcessor } from './getApiKeyValidationValidateActionProcessor';

vi.mock('../../../logic/apiGateway/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));

const resolveProcessor = async () => {
  const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'eu-west-1')]);
  const processors = await getApiKeyValidationValidateActionProcessor(config, {} as any);
  return processors[ApiKeyValidationActionType.Validate];
};

const invoke = (processor: any, apiKeyValue: string) => invokeProcessor(processor, { apiKeyValue, apiKeyReferences: [{ name: 'key' }] });

describe('getApiKeyValidationValidateActionProcessor', () => {
  beforeEach(() => {
    vi.mocked(getApiKeys).mockReset();
  });

  it('resolves each api key reference to its runtime name', async () => {
    vi.mocked(getApiKeys).mockResolvedValue([]);
    const processor = await resolveProcessor();

    await invoke(processor, 'anything');

    expect(getApiKeys).toHaveBeenCalledWith('eu-west-1', 'key-test-app-test-module-development');
  });

  it('returns true when a configured key matches the provided value', async () => {
    vi.mocked(getApiKeys).mockResolvedValue([{ value: 'secret' }] as any);
    const processor = await resolveProcessor();

    expect(await invoke(processor, 'secret')).toEqual([true]);
  });

  it('returns false when no configured key matches', async () => {
    vi.mocked(getApiKeys).mockResolvedValue([{ value: 'secret' }] as any);
    const processor = await resolveProcessor();

    expect(await invoke(processor, 'wrongg')).toEqual([false]);
  });

  it('returns false when the provided value differs in length', async () => {
    vi.mocked(getApiKeys).mockResolvedValue([{ value: 'secret' }] as any);
    const processor = await resolveProcessor();

    expect(await invoke(processor, 'short')).toEqual([false]);
  });
});
