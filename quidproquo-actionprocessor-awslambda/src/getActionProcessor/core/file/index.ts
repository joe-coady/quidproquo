import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';

import getFileExistsActionProcessor from './getFileExistsActionProcessor';
import getFileListDirectoryActionProcessor from './getFileListDirectoryActionProcessor';
import getFileReadTextContentsActionProcessor from './getFileReadTextContentsActionProcessor';
import getFileWriteTextContentsActionProcessor from './getFileWriteTextContentsActionProcessor';

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  ...getFileExistsActionProcessor(runtimeConfig),
  ...getFileListDirectoryActionProcessor(runtimeConfig),
  ...getFileReadTextContentsActionProcessor(runtimeConfig),
  ...getFileWriteTextContentsActionProcessor(runtimeConfig),
});
