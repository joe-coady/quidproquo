import { QPQConfig } from 'quidproquo-core';
import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';

import getFileDeleteActionProcessor from './getFileDeleteActionProcessor';
import getFileExistsActionProcessor from './getFileExistsActionProcessor';
import getFileListDirectoryActionProcessor from './getFileListDirectoryActionProcessor';
import getFileReadTextContentsActionProcessor from './getFileReadTextContentsActionProcessor';
import getFileWriteTextContentsActionProcessor from './getFileWriteTextContentsActionProcessor';
import getFileReadBinaryContentsActionProcessor from './getFileReadBinaryContentsActionProcessor';
import getFileWriteBinaryContentsActionProcessor from './getFileWriteBinaryContentsActionProcessor';

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  ...getFileDeleteActionProcessor(qpqConfig, awsResourceMap),
  ...getFileExistsActionProcessor(qpqConfig, awsResourceMap),
  ...getFileListDirectoryActionProcessor(qpqConfig, awsResourceMap),
  ...getFileReadTextContentsActionProcessor(qpqConfig, awsResourceMap),
  ...getFileWriteTextContentsActionProcessor(qpqConfig, awsResourceMap),
  ...getFileReadBinaryContentsActionProcessor(qpqConfig, awsResourceMap),
  ...getFileWriteBinaryContentsActionProcessor(qpqConfig, awsResourceMap),
});
