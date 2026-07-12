import { describe, expect, it } from 'vitest';

import { captureRequester, runStory, throwsError } from '../../testing';
import { AiActionType } from './AiActionType';
import { AiModel } from './AiModel';
import { askAiPromptStream } from './AiPromptStreamActionRequester';

describe('askAiPromptStream', () => {
  it('yields a PromptStream action with the model, prompt and options', () => {
    const messages = [{ role: 'user', content: 'hi' }] as any;

    const { action } = captureRequester(
      askAiPromptStream(AiModel.ClaudeSonnet45, 'stream it', {
        system: 'be helpful',
        aiName: 'bob',
        messages,
        reasoning: { budgetTokens: 2048 },
        caching: true,
      }),
    );

    expect(action).toEqual({
      type: AiActionType.PromptStream,
      payload: {
        model: AiModel.ClaudeSonnet45,
        prompt: 'stream it',
        messages,
        system: 'be helpful',
        aiName: 'bob',
        reasoning: { budgetTokens: 2048 },
        caching: true,
      },
    });
  });

  it('maps optional fields to undefined when no options are given', () => {
    const { action } = captureRequester(askAiPromptStream(AiModel.ClaudeHaiku45, 'hello'));

    expect(action).toEqual({
      type: AiActionType.PromptStream,
      payload: {
        model: AiModel.ClaudeHaiku45,
        prompt: 'hello',
        messages: undefined,
        system: undefined,
        aiName: undefined,
        reasoning: undefined,
        caching: undefined,
      },
    });
  });

  it('returns the stream result the runtime resolves', () => {
    const result = { text: 'streamed' };
    const { returned } = captureRequester(askAiPromptStream(AiModel.ClaudeHaiku45, 'hello'), result);

    expect(returned).toBe(result);
  });

  it('propagates a processor failure as a thrown story error', () => {
    const failingRun = () =>
      runStory(askAiPromptStream(AiModel.ClaudeHaiku45, 'hello'), {
        [AiActionType.PromptStream]: throwsError('GenericError', 'model unavailable'),
      });

    expect(failingRun).toThrow('GenericError: model unavailable');
  });
});
