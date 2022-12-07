import { FileReadTextContentsActionProcessor, actionResult, FileActionType } from 'quidproquo-core';
import { readTextFile } from '../../../logic/s3/s3Utils';

const processFileReadTextContents: FileReadTextContentsActionProcessor = async ({
  drive,
  filepath,
}) => {
  return actionResult(await readTextFile(drive, filepath));
};

export default {
  [FileActionType.ReadTextContents]: processFileReadTextContents,
};
