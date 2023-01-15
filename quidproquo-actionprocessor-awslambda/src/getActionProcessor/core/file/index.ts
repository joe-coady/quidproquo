import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';

import getFileDeleteActionProcessor from './getFileDeleteActionProcessor';
import getFileExistsActionProcessor from './getFileExistsActionProcessor';
import getFileListDirectoryActionProcessor from './getFileListDirectoryActionProcessor';
import getFileReadTextContentsActionProcessor from './getFileReadTextContentsActionProcessor';
import getFileWriteTextContentsActionProcessor from './getFileWriteTextContentsActionProcessor';
import getFileReadBinaryContentsActionProcessor from './getFileReadBinaryContentsActionProcessor';
import getFileWriteBinaryContentsActionProcessor from './getFileWriteBinaryContentsActionProcessor';

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  ...getFileDeleteActionProcessor(runtimeConfig),
  ...getFileExistsActionProcessor(runtimeConfig),
  ...getFileListDirectoryActionProcessor(runtimeConfig),
  ...getFileReadTextContentsActionProcessor(runtimeConfig),
  ...getFileWriteTextContentsActionProcessor(runtimeConfig),
  ...getFileReadBinaryContentsActionProcessor(runtimeConfig),
  ...getFileWriteBinaryContentsActionProcessor(runtimeConfig),
});
