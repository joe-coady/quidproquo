import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getFileDeleteActionProcessor } from './getFileDeleteActionProcessor';
import { getFileExistsActionProcessor } from './getFileExistsActionProcessor';
import { getFileGenerateTemporarySecureUrlActionProcessor } from './getFileGenerateTemporarySecureUrlActionProcessor';
import { getFileListDirectoryActionProcessor } from './getFileListDirectoryActionProcessor';
import { getFileReadTextContentsActionProcessor } from './getFileReadTextContentsActionProcessor';
import { getFileWriteTextContentsActionProcessor } from './getFileWriteTextContentsActionProcessor';
import { getFileReadBinaryContentsActionProcessor } from './getFileReadBinaryContentsActionProcessor';
import { getFileWriteBinaryContentsActionProcessor } from './getFileWriteBinaryContentsActionProcessor';

export const getFileActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getFileDeleteActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getFileExistsActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getFileGenerateTemporarySecureUrlActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getFileListDirectoryActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getFileReadTextContentsActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getFileWriteTextContentsActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getFileReadBinaryContentsActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getFileWriteBinaryContentsActionProcessor(qpqConfig, dynamicModuleLoader)),
});
