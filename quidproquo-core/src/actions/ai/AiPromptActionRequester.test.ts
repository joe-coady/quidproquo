import { describe, expect, it } from 'vitest';

import { captureRequester, runStory, throwsError } from '../../testing';
import { AiActionType } from './AiActionType';
import { AiModel } from './AiModel';
import { askAiPrompt } from './AiPromptActionRequester';

describe('askAiPrompt', () => {
  it('yields a Prompt action with the model, prompt and options', () => {
    const messages = [{ role: 'user', content: 'hi' }] as any;

    const { action } = captureRequester(
      askAiPrompt(AiModel.ClaudeSonnet45, 'do the thing', {
        system: 'be helpful',
        aiName: 'bob',
        messages,
        reasoning: { budgetTokens: 2048 },
        caching: true,
      }),
    );

    expect(action).toEqual({
      type: AiActionType.Prompt,
      payload: {
        model: AiModel.ClaudeSonnet45,
        prompt: 'do the thing',
        messages,
        system: 'be helpful',
        aiName: 'bob',
        reasoning: { budgetTokens: 2048 },
        caching: true,
      },
    });
  });

  it('maps optional fields to undefined when no options are given', () => {
    const { action } = captureRequester(askAiPrompt(AiModel.ClaudeHaiku45, 'hello'));

    expect(action).toEqual({
      type: AiActionType.Prompt,
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

  it('returns the completion the runtime resolves', () => {
    const completion = { text: 'done' };
    const { returned } = captureRequester(askAiPrompt(AiModel.ClaudeHaiku45, 'hello'), completion);

    expect(returned).toBe(completion);
  });

  it('propagates a processor failure as a thrown story error', () => {
    const failingRun = () =>
      runStory(askAiPrompt(AiModel.ClaudeHaiku45, 'hello'), {
        [AiActionType.Prompt]: throwsError('GenericError', 'model unavailable'),
      });

    expect(failingRun).toThrow('GenericError: model unavailable');
  });
});
