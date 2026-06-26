import { describe, expect, it } from 'vitest';

import { runStory } from '../../testing/storyTesting';
import { AskResponse, EitherActionResult, ErrorTypeEnum } from '../../types';
import { askCatch } from '../system/askCatch';
import { askDecodeJson } from './askDecodeJson';

describe('askDecodeJson', () => {
  it('parses a valid JSON string into an object', () => {
    function* story(): AskResponse<{ a: number }> {
      return yield* askDecodeJson<{ a: number }>('{"a":1}');
    }

    expect(runStory(story())).toEqual({ a: 1 });
  });

  it('errors as Invalid when the JSON cannot be parsed', () => {
    function* story(): AskResponse<EitherActionResult<unknown>> {
      return yield* askCatch(askDecodeJson('not json'));
    }

    const result = runStory(story());
    expect(result.success).toBe(false);
    expect((result as { error: { errorType: string } }).error.errorType).toBe(ErrorTypeEnum.Invalid);
  });

  it('errors as Invalid when the validation function rejects the object', () => {
    function* story(): AskResponse<EitherActionResult<{ a: number }>> {
      return yield* askCatch(askDecodeJson<{ a: number }>('{"a":1}', (obj) => obj.a > 5));
    }

    const result = runStory(story());
    expect(result.success).toBe(false);
    expect((result as { error: { errorType: string } }).error.errorType).toBe(ErrorTypeEnum.Invalid);
  });
});
