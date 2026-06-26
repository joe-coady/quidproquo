import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { FileActionType } from './FileActionType';
import { askFileReadObjectJson } from './FileReadObjectJsonActionRequester';

describe('askFileReadObjectJson', () => {
  it('yields a ReadObjectJson action carrying the drive and filepath', () => {
    const { action } = captureRequester(askFileReadObjectJson('drive', 'path/file.json'));

    expect(action).toEqual({
      type: FileActionType.ReadObjectJson,
      payload: { drive: 'drive', filepath: 'path/file.json' },
    });
  });

  it('returns the parsed object the runtime resolves', () => {
    const parsed = { hello: 'world' };
    const { returned } = captureRequester(askFileReadObjectJson('drive', 'path/file.json'), parsed);

    expect(returned).toBe(parsed);
  });
});
