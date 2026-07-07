import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { FileActionType } from './FileActionType';
import { askFileDelete } from './FileDeleteActionRequester';

describe('askFileDelete', () => {
  it('yields a Delete action carrying the drive and filepaths', () => {
    const { action } = captureRequester(askFileDelete('drive', ['a.txt', 'b.txt']));

    expect(action).toEqual({
      type: FileActionType.Delete,
      payload: { drive: 'drive', filepaths: ['a.txt', 'b.txt'] },
    });
  });

  it('returns the value the runtime resolves', () => {
    const { returned } = captureRequester(askFileDelete('drive', ['a.txt']), undefined);

    expect(returned).toBeUndefined();
  });
});
