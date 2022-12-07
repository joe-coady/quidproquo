import FileListDirectoryActionProcessor from './FileListDirectoryActionProcessor';
import FileReadTextContentsActionProcessor from './FileReadTextContentsActionProcessor';

export default {
  ...FileListDirectoryActionProcessor,
  ...FileReadTextContentsActionProcessor,
};
