export enum FileActionType {
  ReadTextContents = '@quidproquo-core/File/ReadTextContents',
  WriteTextContents = '@quidproquo-core/File/WriteTextContents',
  ListDirectory = '@quidproquo-core/File/ListDirectory',
  Exists = '@quidproquo-core/File/Exists',
}

export const filePathDelimiter = `/`;

export interface FileInfo {
  filepath: string;
  drive: string;
  isDir: boolean;
  hashMd5?: string;
}
