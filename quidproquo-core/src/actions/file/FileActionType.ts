import { CrossServiceResourceName } from '../../types';

export enum FileActionType {
  ReadTextContents = '@quidproquo-core/File/ReadTextContents',
  WriteTextContents = '@quidproquo-core/File/WriteTextContents',
  ListDirectory = '@quidproquo-core/File/ListDirectory',
  Exists = '@quidproquo-core/File/Exists',
  Delete = '@quidproquo-core/File/Delete',
  ReadBinaryContents = '@quidproquo-core/File/ReadBinaryContents',
  WriteBinaryContents = '@quidproquo-core/File/WriteBinaryContents',
}

export const filePathDelimiter = `/`;

export interface FileInfo {
  filepath: string;
  drive: CrossServiceResourceName;
  isDir: boolean;
  hashMd5?: string;
}

export interface DirectoryList {
  fileInfos: FileInfo[];
  pageToken?: string;
}

export type DriveName = string | CrossServiceResourceName;
