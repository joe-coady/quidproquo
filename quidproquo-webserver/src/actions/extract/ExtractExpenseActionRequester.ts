import { ExtractActionType } from './ExtractActionType';
import { ExtractExpenseActionRequester } from './ExtractExpenseActionTypes';

export function* askExtractExpense(storageDriveName: string, filePath: string): ExtractExpenseActionRequester {
  return yield {
    type: ExtractActionType.Expense,
    payload: {
      storageDriveName,
      filePath,
    },
  };
}
