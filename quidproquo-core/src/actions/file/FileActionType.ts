export enum FileActionType {
  ReadTextContents = '@quidproquo-core/File/ReadTextContents',
  ListDirectory = '@quidproquo-core/File/ListDirectory',
}

export const filePathDelimiter = `/`;

export interface FileInfo {
  filepath: string;
  drive: string;
  key?: string;
}
