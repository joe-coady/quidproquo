import { AskResponse, QPQBinaryData } from '../../types';

export enum TextFileType {
  Json = 'Json',
  Xml = 'Xml',
  PlainText = 'PlainText',
  Html = 'Html',
  Css = 'Css',
  JavaScript = 'JavaScript',
  Csv = 'Csv',
  Markdown = 'Markdown',
  Yaml = 'Yaml',
  Rtf = 'Rtf',
}

const TextFileTypeMimeTypeMap: { [key in TextFileType]: string } = {
  [TextFileType.Json]: 'application/json',
  [TextFileType.Xml]: 'application/xml',
  [TextFileType.PlainText]: 'text/plain',
  [TextFileType.Html]: 'text/html',
  [TextFileType.Css]: 'text/css',
  [TextFileType.JavaScript]: 'application/javascript',
  [TextFileType.Csv]: 'text/csv',
  [TextFileType.Markdown]: 'text/markdown',
  [TextFileType.Yaml]: 'application/x-yaml',
  [TextFileType.Rtf]: 'application/rtf',
};

export function* askCreateTextQpqBinaryData(textData: string, filename: string, fileType: TextFileType): AskResponse<QPQBinaryData> {
  const binaryData: QPQBinaryData = {
    base64Data: Buffer.from(textData, 'utf-8').toString('base64'),
    filename: filename,
    mimetype: TextFileTypeMimeTypeMap[fileType],
  };

  return binaryData;
}
