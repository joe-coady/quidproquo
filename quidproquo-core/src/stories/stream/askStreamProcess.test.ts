import { describe, expect, it, vi } from 'vitest';

import { StreamActionType } from '../../actions/stream/StreamActionType';
import { runStory } from '../../testing/storyTesting';
import { AskResponse } from '../../types';
import { StreamChunk, StreamHandle } from '../../types/StreamRegistry';
import { askStreamProcess } from './askStreamProcess';

const handle: StreamHandle<'text', string> = { id: 'stream-1', encoding: 'text' };

// Answers each Read with the next chunk in the queue, ending with a done chunk.
const readsFrom = (chunks: StreamChunk<string>[]) => {
  const queue = [...chunks];
  return () => queue.shift() ?? { done: true };
};

describe('askStreamProcess', () => {
  it('invokes the callback for each chunk and closes the stream', () => {
    const close = vi.fn();
    const seen: Array<[string, number]> = [];

    runStory(
      askStreamProcess(handle, function* (item, index): AskResponse<void> {
        seen.push([item, index]);
      }),
      {
        [StreamActionType.Read]: readsFrom([{ done: false, data: 'a' }, { done: false, data: 'b' }, { done: true }]),
        [StreamActionType.Close]: close,
      },
    );

    expect(seen).toEqual([
      ['a', 0],
      ['b', 1],
    ]);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('skips skipped chunks and chunks with no data', () => {
    const seen: string[] = [];

    runStory(
      askStreamProcess(handle, function* (item): AskResponse<void> {
        seen.push(item);
      }),
      {
        [StreamActionType.Read]: readsFrom([{ done: false, data: 'a' }, { done: false, skipped: true }, { done: false, data: 'c' }, { done: true }]),
        [StreamActionType.Close]: undefined,
      },
    );

    expect(seen).toEqual(['a', 'c']);
  });
});
