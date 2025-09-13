import { createErrorEnumForAction } from 'quidproquo-core';

import { ExtractActionType } from './ExtractActionType';
import { ExtractExpenseActionRequester } from './ExtractExpenseActionTypes';

export const ExtractExpenseErrorTypeEnum = createErrorEnumForAction(ExtractActionType.Expense, [
  'FileNotFound',
  'UnsupportedFormat',
  'InvalidParameter',
  'RateLimited',
  'InvalidStorageClass',
  'AccessDenied',
]);

export function* askExtractExpense(storageDriveName: string, filePath: string): ExtractExpenseActionRequester {
  return yield {
    type: ExtractActionType.Expense,
    payload: {
      storageDriveName,
      filePath,
    },
  };
}
