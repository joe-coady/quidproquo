import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import getFileListDirectoryActionProcessor from './getFileListDirectoryActionProcessor';
import getFileReadTextContentsActionProcessor from './getFileReadTextContentsActionProcessor';

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  ...getFileListDirectoryActionProcessor(runtimeConfig),
  ...getFileReadTextContentsActionProcessor(runtimeConfig),
});
