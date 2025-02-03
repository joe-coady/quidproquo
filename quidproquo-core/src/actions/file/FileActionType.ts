import { StorageDriveTier } from '../../config';

export enum FileActionType {
  ReadTextContents = '@quidproquo-core/File/ReadTextContents',
  WriteTextContents = '@quidproquo-core/File/WriteTextContents',
  WriteObjectJson = '@quidproquo-core/File/WriteObjectJson',
  ReadObjectJson = '@quidproquo-core/File/ReadObjectJson',
  ListDirectory = '@quidproquo-core/File/ListDirectory',
  Exists = '@quidproquo-core/File/Exists',
  Delete = '@quidproquo-core/File/Delete',
  ReadBinaryContents = '@quidproquo-core/File/ReadBinaryContents',
  WriteBinaryContents = '@quidproquo-core/File/WriteBinaryContents',
  GenerateTemporarySecureUrl = '@quidproquo-core/File/GenerateTemporarySecureUrl',
  IsColdStorage = '@quidproquo-core/File/IsColdStorage',
}

export const filePathDelimiter = `/`;

export interface FileInfo {
  filepath: string;
  drive: string;
  isDir: boolean;
  hashMd5?: string;
}

export interface DirectoryList {
  fileInfos: FileInfo[];
  pageToken?: string;
}

export interface StorageDriveAdvancedWriteOptions {
  storageDriveTier?: StorageDriveTier;
}
