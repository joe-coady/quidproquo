import { ExtractActionType } from 'quidproquo-webserver';

const webserverExtractActionComponentMap: Record<string, string[]> = {
  [ExtractActionType.Expense]: ['askExtractExpense', 'storageDriveName', 'filePath'],
};

export default webserverExtractActionComponentMap;
