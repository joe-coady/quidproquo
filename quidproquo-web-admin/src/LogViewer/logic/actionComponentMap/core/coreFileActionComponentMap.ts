import { FileActionType } from 'quidproquo-core';

const coreFileActionComponentMap: Record<string, string[]> = {
  [FileActionType.ReadTextContents]: ['askFileReadTextContents', 'drive', 'filepath'],
  [FileActionType.WriteTextContents]: ['askFileWriteTextContents', 'drive', 'filepath', 'data', 'storageDriveAdvancedWriteOptions'],
  [FileActionType.ListDirectory]: ['askFileListDirectory', 'drive', 'folderPath', 'maxFiles', 'pageToken'],
  [FileActionType.Exists]: ['askFileExists', 'drive', 'filepath'],
  [FileActionType.Delete]: ['askFileDelete', 'drive', 'filepaths'],
  [FileActionType.ReadBinaryContents]: ['askFileReadBinaryContents', 'drive', 'filepath'],
  [FileActionType.WriteBinaryContents]: ['askFileWriteBinaryContents', 'drive', 'filepath', 'data', 'storageDriveAdvancedWriteOptions'],
  [FileActionType.GenerateTemporarySecureUrl]: ['askFileGenerateTemporarySecureUrl', 'drive', 'filepath', 'expirationMs'],
};

export default coreFileActionComponentMap;
