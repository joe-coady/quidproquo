import { defineAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { buildTestQpqConfig, defineStorageDrive } from 'quidproquo-core';
import { ExtractActionType, ExtractExpenseErrorTypeEnum } from 'quidproquo-webserver';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { analyzeExpenseDocument, transformTextractExpenseResponse } from '../../../logic/textract';
import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getExtractExpenseActionProcessor } from './getExtractExpenseActionProcessor';

vi.mock('../../../logic/textract', () => ({
  analyzeExpenseDocument: vi.fn(),
  transformTextractExpenseResponse: vi.fn(),
}));

const resolveProcessor = async () => {
  const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'eu-west-1'), defineStorageDrive('receipts')]);
  const processors = await getExtractExpenseActionProcessor(config, {} as any);
  return processors[ExtractActionType.Expense];
};

const invoke = (processor: any) =>
  invokeProcessor(processor, { storageDriveName: 'receipts', filePath: 'a.pdf' });

describe('getExtractExpenseActionProcessor', () => {
  beforeEach(() => {
    vi.mocked(analyzeExpenseDocument).mockReset();
    vi.mocked(transformTextractExpenseResponse).mockReset();
  });

  it('analyzes the document in the resolved bucket and returns the transformed result', async () => {
    vi.mocked(analyzeExpenseDocument).mockResolvedValue({ raw: true } as any);
    vi.mocked(transformTextractExpenseResponse).mockReturnValue({ total: 10 } as any);
    const processor = await resolveProcessor();

    const result = await invoke(processor);

    expect(result).toEqual([{ total: 10 }]);
    expect(analyzeExpenseDocument).toHaveBeenCalledWith('receipts-test-app-test-module-development', 'a.pdf', 'eu-west-1');
  });

  it('maps a missing key error to a FileNotFound error', async () => {
    vi.mocked(analyzeExpenseDocument).mockRejectedValue(Object.assign(new Error('gone'), { name: 'NoSuchKey' }));
    const processor = await resolveProcessor();

    const [, error] = await invoke(processor);

    expect(error?.errorType).toBe(ExtractExpenseErrorTypeEnum.FileNotFound);
  });
});
