import { describe, expect, it } from 'vitest';

import { runStory } from '../../testing';
import { AskResponse } from '../../types';
import { GuidActionType } from '../guid/GuidActionType';
import { askNewGuid } from '../guid/GuidNewActionRequester';
import { MathActionType } from '../math/MathActionType';
import { askRandomNumber } from '../math/MathRandomNumberActionRequester';
import { askParallelDEPRECATED } from './SystemRunParallelActionRequester';

describe('askParallelDEPRECATED', () => {
  it('runs each story and returns their results positionally', () => {
    function* storyA(): AskResponse<number> {
      return yield* askRandomNumber();
    }
    function* storyB(): AskResponse<string> {
      return yield* askNewGuid();
    }

    const result = runStory(askParallelDEPRECATED([[storyA], [storyB]]), {
      [MathActionType.RandomNumber]: 0.5,
      [GuidActionType.New]: 'abc',
    });

    expect(result).toEqual([0.5, 'abc']);
  });

  it('passes the trailing tuple entries as story arguments', () => {
    function* echo(prefix: string): AskResponse<string> {
      const guid = yield* askNewGuid();
      return `${prefix}-${guid}`;
    }

    const result = runStory(askParallelDEPRECATED([[echo, 'first'], [echo, 'second']]), {
      [GuidActionType.New]: 'g',
    });

    expect(result).toEqual(['first-g', 'second-g']);
  });
});
