import { APIGatewayEvent } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import { parseMultipartFormData } from './parseMultipartFormData';

const BOUNDARY = 'testboundary';

const buildMultipartBody = (parts: string[]): string => `${parts.map((p) => `--${BOUNDARY}\r\n${p}`).join('')}--${BOUNDARY}--\r\n`;

const filePart = (name: string, filename: string, contentType: string, content: string): string =>
  `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n${content}\r\n`;

const fieldPart = (name: string, value: string): string => `Content-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;

const buildEvent = (body: string, headers: Record<string, string>, isBase64Encoded = false): APIGatewayEvent =>
  ({ body, headers, isBase64Encoded }) as unknown as APIGatewayEvent;

describe('parseMultipartFormData', () => {
  it('returns base64 encoded file records mapped to QPQBinaryData', async () => {
    const body = buildMultipartBody([filePart('upload', 'hello.txt', 'text/plain', 'hello world')]);

    const files = await parseMultipartFormData(buildEvent(body, { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` }));

    expect(files).toEqual([
      {
        filename: 'hello.txt',
        mimetype: 'text/plain',
        base64Data: Buffer.from('hello world').toString('base64'),
      },
    ]);
  });

  it('ignores fields and only returns files', async () => {
    const body = buildMultipartBody([fieldPart('name', 'joe'), filePart('upload', 'a.txt', 'text/plain', 'abc')]);

    const files = await parseMultipartFormData(buildEvent(body, { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` }));

    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('a.txt');
  });

  it('skips empty files', async () => {
    const body = buildMultipartBody([filePart('upload', 'empty.txt', 'text/plain', '')]);

    const files = await parseMultipartFormData(buildEvent(body, { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` }));

    expect(files).toEqual([]);
  });

  it('reads the Content-Type header when content-type is absent', async () => {
    const body = buildMultipartBody([filePart('upload', 'cased.txt', 'text/plain', 'data')]);

    const files = await parseMultipartFormData(buildEvent(body, { 'Content-Type': `multipart/form-data; boundary=${BOUNDARY}` }));

    expect(files[0].filename).toBe('cased.txt');
  });

  it('decodes a base64 encoded event body', async () => {
    const rawBody = buildMultipartBody([filePart('upload', 'b64.txt', 'text/plain', 'payload')]);
    const body = Buffer.from(rawBody, 'binary').toString('base64');

    const files = await parseMultipartFormData(buildEvent(body, { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` }, true));

    expect(files[0].base64Data).toBe(Buffer.from('payload').toString('base64'));
  });
});
