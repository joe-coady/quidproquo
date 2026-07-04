import { AiActionType, ErrorTypeEnum } from 'quidproquo-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getAiPromptStreamActionProcessor } from './getAiPromptStreamActionProcessor';
import { mapAiStreamPart, prepareAiPromptCall } from './logic';

vi.mock('./logic', () => ({
  prepareAiPromptCall: vi.fn(),
  createDriveFileResolver: vi.fn(() => vi.fn()),
  toSdkMessages: vi.fn(async () => [{ role: 'user', content: 'mapped' }]),
  mapAiStreamPart: vi.fn(() => ({ mapped: true })),
}));

const streamText = vi.fn();
vi.mock('ai', () => ({
  streamText: (args: unknown) => streamText(args),
  stepCountIs: (n: number) => ({ __stop: n }),
}));

vi.mock('../../../awsLambdaUtils', () => ({ randomGuid: () => 'guid' }));

const buildRegistry = () => ({ register: vi.fn() });

const invoke = async (payload: Record<string, unknown>, streamRegistry: unknown) => {
  const processor = (await getAiPromptStreamActionProcessor({} as never, null as any))[AiActionType.PromptStream];
  return invokeProcessor(processor, payload, { streamRegistry });
};

describe('getProcessAiPromptStream', () => {
  beforeEach(() => {
    vi.mocked(prepareAiPromptCall).mockReset();
    streamText.mockReset();
  });

  it('returns an action error when preparation fails', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ error: { type: ErrorTypeEnum.NotImplemented, message: 'bad model' } });

    const [result, error] = await invoke({ prompt: 'hi' }, buildRegistry());

    expect(result).toBeUndefined();
    expect(error?.errorType).toBe(ErrorTypeEnum.NotImplemented);
  });

  it('registers a json-encoded stream and returns its id', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ model: {} as never, tools: undefined });
    streamText.mockReturnValue({
      fullStream: (async function* () {
        yield { type: 'text-delta' };
      })(),
    });
    const registry = buildRegistry();

    const [result] = await invoke({ prompt: 'hi' }, registry);

    expect(result?.encoding).toBe('json');
    expect(result?.id).toContain('ai-prompt-');
    expect(registry.register).toHaveBeenCalledWith(result?.id, expect.anything());

    const iterator = registry.register.mock.calls[0][1] as AsyncIterableIterator<string>;
    const chunks: string[] = [];
    for await (const chunk of iterator) {
      chunks.push(chunk);
    }
    expect(chunks).toEqual([JSON.stringify({ mapped: true })]);
    expect(mapAiStreamPart).toHaveBeenCalledWith({ type: 'text-delta' });
  });

  it('maps a thrown Error to a GenericError result', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ model: {} as never, tools: undefined });
    streamText.mockImplementation(() => {
      throw new Error('stream boom');
    });

    const [, error] = await invoke({ prompt: 'hi' }, buildRegistry());

    expect(error).toEqual({ errorType: ErrorTypeEnum.GenericError, errorText: 'stream boom', errorStack: undefined });
  });

  it('maps a thrown non-Error to a generic message', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ model: {} as never, tools: undefined });
    streamText.mockImplementation(() => {
      throw 'weird';
    });

    const [, error] = await invoke({ prompt: 'hi' }, buildRegistry());

    expect(error?.errorText).toBe('An error occurred during AI prompt stream.');
  });
});
