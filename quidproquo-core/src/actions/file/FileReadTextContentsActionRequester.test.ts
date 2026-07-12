import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { FileActionType } from './FileActionType';
import { askFileReadTextContents } from './FileReadTextContentsActionRequester';

describe('askFileReadTextContents', () => {
  it('yields a ReadTextContents action carrying the drive and filepath', () => {
    const { action } = captureRequester(askFileReadTextContents('drive', 'path/file.txt'));

    expect(action).toEqual({
      type: FileActionType.ReadTextContents,
      payload: { drive: 'drive', filepath: 'path/file.txt' },
    });
  });

  it('returns the value the runtime resolves', () => {
    const { returned } = captureRequester(askFileReadTextContents('drive', 'path/file.txt'), 'file body');

    expect(returned).toBe('file body');
  });

  it('forwards the tenant scope onto the payload', () => {
    const { action } = captureRequester(askFileReadTextContents('drive', 'path/file.txt', 'tenant-a'));

    expect(action.payload.scope).toBe('tenant-a');
  });
});
