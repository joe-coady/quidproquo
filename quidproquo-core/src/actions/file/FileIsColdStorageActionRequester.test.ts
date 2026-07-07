import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { FileActionType } from './FileActionType';
import { askFileIsColdStorage } from './FileIsColdStorageActionRequester';

describe('askFileIsColdStorage', () => {
  it('yields an IsColdStorage action carrying the drive and filepath', () => {
    const { action } = captureRequester(askFileIsColdStorage('drive', 'path/file.txt'));

    expect(action).toEqual({
      type: FileActionType.IsColdStorage,
      payload: { drive: 'drive', filepath: 'path/file.txt' },
    });
  });

  it('returns the value the runtime resolves', () => {
    const { returned } = captureRequester(askFileIsColdStorage('drive', 'path/file.txt'), false);

    expect(returned).toBe(false);
  });
});
