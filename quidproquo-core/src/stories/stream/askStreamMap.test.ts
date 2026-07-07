import { describe, expect, it, vi } from 'vitest';

import { StreamActionType } from '../../actions/stream/StreamActionType';
import { runStory } from '../../testing/storyTesting';
import { AskResponse } from '../../types';
import { StreamChunk, StreamHandle } from '../../types/StreamRegistry';
import { askStreamMap } from './askStreamMap';

const handle: StreamHandle<'text', string> = { id: 'stream-1', encoding: 'text' };

// Answers each Read with the next chunk in the queue, ending with a done chunk.
const readsFrom = (chunks: StreamChunk<string>[]) => {
  const queue = [...chunks];
  return () => queue.shift() ?? { done: true };
};

describe('askStreamMap', () => {
  it('maps each chunk through the callback and closes the stream', () => {
    const close = vi.fn();

    const result = runStory(
      askStreamMap(handle, function* (item, index): AskResponse<string> {
        return `${index}:${item}`;
      }),
      {
        [StreamActionType.Read]: readsFrom([{ done: false, data: 'a' }, { done: false, data: 'b' }, { done: true }]),
        [StreamActionType.Close]: close,
      },
    );

    expect(result).toEqual(['0:a', '1:b']);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('skips skipped chunks and chunks with no data', () => {
    const result = runStory(askStreamMap(handle), {
      [StreamActionType.Read]: readsFrom([{ done: false, data: 'a' }, { done: false, skipped: true }, { done: false, data: 'c' }, { done: true }]),
      [StreamActionType.Close]: undefined,
    });

    expect(result).toEqual(['a', 'c']);
  });

  it('returns an empty array for an immediately-done stream', () => {
    const result = runStory(askStreamMap(handle), {
      [StreamActionType.Read]: { done: true },
      [StreamActionType.Close]: undefined,
    });

    expect(result).toEqual([]);
  });
});
