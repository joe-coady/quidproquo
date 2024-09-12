import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getFileDeleteActionProcessor } from './getFileDeleteActionProcessor';
import { getFileExistsActionProcessor } from './getFileExistsActionProcessor';
import { getFileGenerateTemporarySecureUrlActionProcessor } from './getFileGenerateTemporarySecureUrlActionProcessor';
import { getFileListDirectoryActionProcessor } from './getFileListDirectoryActionProcessor';
import { getFileReadTextContentsActionProcessor } from './getFileReadTextContentsActionProcessor';
import { getFileWriteTextContentsActionProcessor } from './getFileWriteTextContentsActionProcessor';
import { getFileReadBinaryContentsActionProcessor } from './getFileReadBinaryContentsActionProcessor';
import { getFileWriteBinaryContentsActionProcessor } from './getFileWriteBinaryContentsActionProcessor';

export const getFileActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getFileDeleteActionProcessor(qpqConfig)),
  ...(await getFileExistsActionProcessor(qpqConfig)),
  ...(await getFileGenerateTemporarySecureUrlActionProcessor(qpqConfig)),
  ...(await getFileListDirectoryActionProcessor(qpqConfig)),
  ...(await getFileReadTextContentsActionProcessor(qpqConfig)),
  ...(await getFileWriteTextContentsActionProcessor(qpqConfig)),
  ...(await getFileReadBinaryContentsActionProcessor(qpqConfig)),
  ...(await getFileWriteBinaryContentsActionProcessor(qpqConfig)),
});
