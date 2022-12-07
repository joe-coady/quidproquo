import { FileListDirectoryActionProcessor, actionResult, FileActionType } from 'quidproquo-core';
import { listFiles } from '../../../logic/s3/s3Utils';

const processFileListDirectory: FileListDirectoryActionProcessor = async ({
  drive,
  folderPath,
}) => {
  return actionResult(await listFiles(drive, folderPath));
};

export default {
  [FileActionType.ListDirectory]: processFileListDirectory,
};
