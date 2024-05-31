import Busboy from 'busboy';

import { APIGatewayEvent } from 'aws-lambda';
import { QPQBinaryData } from 'quidproquo-core';

interface MultipartFile {
  name: string;
  filename: string;
  content: Buffer;
  contentType: string;
  encoding: string;
}

interface BusboyInfo {
  filename: string;
  encoding: string;
  mimeType: string;
}

type MultipartRequest = {
  fields: Record<string, string>;
  files: MultipartFile[];
};

export const parseMultipartFormData = (event: APIGatewayEvent): Promise<QPQBinaryData[]> =>
  new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type'],
      },
    });

    const result: MultipartRequest = {
      files: [],
      fields: {},
    };

    busboy.on('file', (name: string, file: any, info: BusboyInfo) => {
      let fileBuffer = Buffer.alloc(0);

      file.on('data', (data: Buffer) => {
        fileBuffer = Buffer.concat([fileBuffer, data]); // Concatenate the new data to the existing buffer
      });

      file.on('end', () => {
        if (fileBuffer.length > 0) {
          result.files.push({
            filename: info.filename,
            contentType: info.mimeType,
            encoding: info.encoding,
            name: name,
            content: fileBuffer,
          });
        }
      });
    });

    busboy.on('field', (name: string, value: string) => {
      result.fields[name] = value;
    });

    busboy.on('error', (error: any) => {
      reject(error);
    });

    busboy.on('finish', () => {
      const qpqBinaryFiles: QPQBinaryData[] = result.files.map(
        (f) =>
          ({
            filename: f.filename,
            mimetype: f.contentType,
            base64Data: f.content.toString('base64'),
          }) as QPQBinaryData,
      );

      resolve(qpqBinaryFiles);
    });

    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    busboy.end();
  });
