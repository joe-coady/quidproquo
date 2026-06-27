import { ErrorTypeEnum, FileActionType, resolveActionResult, resolveActionResultError } from 'quidproquo-core';

import * as fs from 'fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { errorWithCode, fileConfig, runFileAction } from '../../testing/fileProcessorTestHelpers';
import { getFileReadObjectJsonActionProcessor } from './getFileReadObjectJsonActionProcessor';

vi.mock('fs/promises');

const invoke = () => runFileAction(getFileReadObjectJsonActionProcessor(fileConfig), FileActionType.ReadObjectJson, { filepath: 'data.json' });

afterEach(() => {
  vi.clearAllMocks();
});

describe('getFileReadObjectJsonActionProcessor', () => {
  it('returns the parsed json object on success', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('{"a":1}');

    const result = await invoke();

    expect(resolveActionResult(result)).toEqual({ a: 1 });
  });

  it('returns NotFound when the file is missing', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(errorWithCode('ENOENT'));

    const result = await invoke();

    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.NotFound);
  });

  it('returns GenericError when the json is invalid', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('not json');

    const result = await invoke();

    const error = resolveActionResultError(result);
    expect(error.errorType).toBe(ErrorTypeEnum.GenericError);
    expect(error.errorText).toContain('Invalid JSON');
  });

  it('returns GenericError for any other failure', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(errorWithCode('EACCES'));

    const result = await invoke();

    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.GenericError);
  });
});
