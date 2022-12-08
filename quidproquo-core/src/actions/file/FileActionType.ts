export enum FileActionType {
  ReadTextContents = '@quidproquo-core/File/ReadTextContents',
  WriteTextContents = '@quidproquo-core/File/WriteTextContents',
  ListDirectory = '@quidproquo-core/File/ListDirectory',
}

export const filePathDelimiter = `/`;

export interface FileInfo {
  filepath: string;
  drive: string;
  isDir: boolean;
  hashMd5?: string;
}
