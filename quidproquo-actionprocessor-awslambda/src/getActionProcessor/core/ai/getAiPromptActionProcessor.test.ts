import { AiActionType, ErrorTypeEnum } from 'quidproquo-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getAiPromptActionProcessor } from './getAiPromptActionProcessor';
import { prepareAiPromptCall, toSdkMessages } from './logic';

vi.mock('./logic', () => ({
  prepareAiPromptCall: vi.fn(),
  createDriveFileResolver: vi.fn(() => vi.fn()),
  toSdkMessages: vi.fn(async () => [{ role: 'user', content: 'mapped' }]),
}));

const generateText = vi.fn();
vi.mock('ai', () => ({
  generateText: (args: unknown) => generateText(args),
  stepCountIs: (n: number) => ({ __stop: n }),
}));

const invoke = async (payload: Record<string, unknown>) => {
  const processor = (await getAiPromptActionProcessor({} as never, null as any))[AiActionType.Prompt];
  return invokeProcessor(processor, payload);
};

describe('getProcessAiPrompt', () => {
  beforeEach(() => {
    vi.mocked(prepareAiPromptCall).mockReset();
    generateText.mockReset();
  });

  it('returns an action error when preparation fails', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ error: { type: ErrorTypeEnum.NotFound, message: 'no ai' } });

    const [result, error] = await invoke({ prompt: 'hi' });

    expect(result).toBeUndefined();
    expect(error?.errorType).toBe(ErrorTypeEnum.NotFound);
  });

  it('generates text from a prompt payload', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ model: { id: 'm' } as never, tools: undefined });
    generateText.mockResolvedValue({ text: 'hello world' });

    const [result] = await invoke({ prompt: 'hi', system: 'sys' });

    expect(result).toEqual({ text: 'hello world' });
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'hi', system: 'sys' }));
  });

  it('maps messages when the payload carries them', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ model: { id: 'm' } as never, tools: undefined });
    generateText.mockResolvedValue({ text: 'ok' });

    await invoke({ messages: [{ role: 'user', content: 'hi' }] });

    expect(toSdkMessages).toHaveBeenCalled();
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({ messages: [{ role: 'user', content: 'mapped' }] }));
  });

  it('maps a thrown Error to a GenericError result', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ model: {} as never, tools: undefined });
    generateText.mockRejectedValue(new Error('exploded'));

    const [, error] = await invoke({ prompt: 'hi' });

    expect(error).toEqual({ errorType: ErrorTypeEnum.GenericError, errorText: 'exploded', errorStack: undefined });
  });

  it('maps a thrown non-Error to a generic message', async () => {
    vi.mocked(prepareAiPromptCall).mockReturnValue({ model: {} as never, tools: undefined });
    generateText.mockRejectedValue('weird');

    const [, error] = await invoke({ prompt: 'hi' });

    expect(error?.errorText).toBe('An error occurred during AI prompt execution.');
  });
});
