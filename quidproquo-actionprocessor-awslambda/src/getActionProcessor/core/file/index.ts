import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';

import getFileDeleteActionProcessor from './getFileDeleteActionProcessor';
import getFileExistsActionProcessor from './getFileExistsActionProcessor';
import getFileListDirectoryActionProcessor from './getFileListDirectoryActionProcessor';
import getFileReadTextContentsActionProcessor from './getFileReadTextContentsActionProcessor';
import getFileWriteTextContentsActionProcessor from './getFileWriteTextContentsActionProcessor';

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  ...getFileDeleteActionProcessor(runtimeConfig),
  ...getFileExistsActionProcessor(runtimeConfig),
  ...getFileListDirectoryActionProcessor(runtimeConfig),
  ...getFileReadTextContentsActionProcessor(runtimeConfig),
  ...getFileWriteTextContentsActionProcessor(runtimeConfig),
});
