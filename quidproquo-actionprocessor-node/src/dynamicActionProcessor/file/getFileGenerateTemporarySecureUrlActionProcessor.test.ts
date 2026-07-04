import { ErrorTypeEnum, FileActionType, resolveActionResult, resolveActionResultError } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { fileConfig, runFileAction } from '../../testing/fileProcessorTestHelpers';
import { getFileGenerateTemporarySecureUrlActionProcessor } from './getFileGenerateTemporarySecureUrlActionProcessor';
import { verifySecureUrlToken } from './secureUrlUtils';

const invoke = (filepath: string) =>
  runFileAction(getFileGenerateTemporarySecureUrlActionProcessor(fileConfig), FileActionType.GenerateTemporarySecureUrl, {
    filepath,
    expirationMs: 60_000,
  });

describe('getFileGenerateTemporarySecureUrlActionProcessor', () => {
  it('returns a signed download url for the resolved file', async () => {
    const result = await invoke('a.txt');

    const url = resolveActionResult(result) as string;
    expect(url.startsWith('http://localhost:4000/secure-download?token=')).toBe(true);

    const token = url.split('token=')[1];
    const decoded = verifySecureUrlToken(token, fileConfig.secureUrlSecret);
    expect(decoded?.operation).toBe('download');
  });

  it('returns GenericError when the path cannot be resolved', async () => {
    const result = await invoke('/etc/passwd');

    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.GenericError);
  });
});
