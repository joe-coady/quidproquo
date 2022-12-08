import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';

import getFileListDirectoryActionProcessor from './getFileListDirectoryActionProcessor';
import getFileReadTextContentsActionProcessor from './getFileReadTextContentsActionProcessor';
import getFileWriteTextContentsActionProcessor from './getFileWriteTextContentsActionProcessor';

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  ...getFileListDirectoryActionProcessor(runtimeConfig),
  ...getFileReadTextContentsActionProcessor(runtimeConfig),
  ...getFileWriteTextContentsActionProcessor(runtimeConfig),
});
