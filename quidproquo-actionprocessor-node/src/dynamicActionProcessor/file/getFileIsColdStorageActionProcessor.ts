import { actionResult, askFileIsColdStorage, createActionProcessor, FileActionType, ProcessorFor, QPQConfig } from 'quidproquo-core';

import { FileStorageConfig } from './types';

const getProcessFileIsColdStorage =
  (config: FileStorageConfig) =>
  (qpqConfig: QPQConfig): ProcessorFor<typeof askFileIsColdStorage> => {
    return async ({ drive, filepath }) => {
      // Local filesystem doesn't have cold storage, always return false
      return actionResult(false);
    };
  };

export const getFileIsColdStorageActionProcessor = (config: FileStorageConfig) =>
  createActionProcessor(askFileIsColdStorage, (qpqConfig) => getProcessFileIsColdStorage(config)(qpqConfig));
