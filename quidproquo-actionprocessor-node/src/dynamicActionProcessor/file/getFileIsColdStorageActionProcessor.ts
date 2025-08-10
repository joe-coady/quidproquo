import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileIsColdStorageActionProcessor,
  QPQConfig,
} from 'quidproquo-core';
import { FileStorageConfig } from './types';

const getProcessFileIsColdStorage = (config: FileStorageConfig) => (qpqConfig: QPQConfig): FileIsColdStorageActionProcessor => {
  return async ({ drive, filepath }) => {
    // Local filesystem doesn't have cold storage, always return false
    return actionResult(false);
  };
};

export const getFileIsColdStorageActionProcessor = (config: FileStorageConfig): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.IsColdStorage]: getProcessFileIsColdStorage(config)(qpqConfig),
});