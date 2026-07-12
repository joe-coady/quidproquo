import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { FileActionType } from './FileActionType';
import { askFileExists } from './FileExistsActionRequester';

describe('askFileExists', () => {
  it('yields an Exists action carrying the drive and filepath', () => {
    const { action } = captureRequester(askFileExists('drive', 'path/file.txt'));

    expect(action).toEqual({
      type: FileActionType.Exists,
      payload: { drive: 'drive', filepath: 'path/file.txt' },
    });
  });

  it('returns the value the runtime resolves', () => {
    const { returned } = captureRequester(askFileExists('drive', 'path/file.txt'), true);

    expect(returned).toBe(true);
  });

  it('forwards the tenant scope onto the payload', () => {
    const { action } = captureRequester(askFileExists('drive', 'path/file.txt', 'tenant-a'));

    expect(action.payload.scope).toBe('tenant-a');
  });
});
