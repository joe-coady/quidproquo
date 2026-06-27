import { captureRequester } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { ExtractActionType } from './ExtractActionType';
import { askExtractExpense, ExtractExpenseErrorTypeEnum } from './ExtractExpenseActionRequester';

describe('askExtractExpense', () => {
  it('yields an Expense action with the storage drive and file path', () => {
    const { action } = captureRequester(askExtractExpense('drive', 'receipts/1.pdf'));

    expect(action).toEqual({
      type: ExtractActionType.Expense,
      payload: { storageDriveName: 'drive', filePath: 'receipts/1.pdf' },
    });
  });
});

describe('ExtractExpenseErrorTypeEnum', () => {
  it('namespaces each error name under the Expense action type', () => {
    expect(ExtractExpenseErrorTypeEnum.FileNotFound).toBe(`${ExtractActionType.Expense}-FileNotFound`);
    expect(ExtractExpenseErrorTypeEnum.AccessDenied).toBe(`${ExtractActionType.Expense}-AccessDenied`);
  });
});
