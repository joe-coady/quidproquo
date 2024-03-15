import { QPQConfig } from 'quidproquo-core';

import getFileDeleteActionProcessor from './getFileDeleteActionProcessor';
import getFileExistsActionProcessor from './getFileExistsActionProcessor';
import getFileGenerateTemporarySecureUrlActionProcessor from './getFileGenerateTemporarySecureUrlActionProcessor';
import getFileListDirectoryActionProcessor from './getFileListDirectoryActionProcessor';
import getFileReadTextContentsActionProcessor from './getFileReadTextContentsActionProcessor';
import getFileWriteTextContentsActionProcessor from './getFileWriteTextContentsActionProcessor';
import getFileReadBinaryContentsActionProcessor from './getFileReadBinaryContentsActionProcessor';
import getFileWriteBinaryContentsActionProcessor from './getFileWriteBinaryContentsActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getFileDeleteActionProcessor(qpqConfig),
  ...getFileExistsActionProcessor(qpqConfig),
  ...getFileGenerateTemporarySecureUrlActionProcessor(qpqConfig),
  ...getFileListDirectoryActionProcessor(qpqConfig),
  ...getFileReadTextContentsActionProcessor(qpqConfig),
  ...getFileWriteTextContentsActionProcessor(qpqConfig),
  ...getFileReadBinaryContentsActionProcessor(qpqConfig),
  ...getFileWriteBinaryContentsActionProcessor(qpqConfig),
});
