import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ErrorTypeEnum,
  FileActionType,
  FileStreamOpenActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { Readable } from 'stream';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { createAwsClient } from '../../../logic/createAwsClient';
import { resolveStorageDriveBucketName } from './utils';

async function* chunkedReadableIterator(
  stream: Readable,
  chunkSize: number,
  transform: (buf: Buffer) => string,
): AsyncIterableIterator<string> {
  let buffer = Buffer.alloc(0);

  for await (const chunk of stream) {
    const incoming = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : (chunk as Buffer);
    buffer = Buffer.concat([buffer, incoming]);

    while (buffer.length >= chunkSize) {
      yield transform(buffer.subarray(0, chunkSize));
      buffer = buffer.subarray(chunkSize);
    }
  }

  if (buffer.length > 0) {
    yield transform(buffer);
  }
}

const getProcessFileStreamOpen = (qpqConfig: QPQConfig): FileStreamOpenActionProcessor => {
  return async ({ drive, filepath, encoding, chunkSize }, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);
      const s3Client = createAwsClient(S3Client, { region });

      const response = await s3Client.send(
        new GetObjectCommand({
          Key: filepath,
          Bucket: s3BucketName,
        }),
      );

      if (!response.Body) {
        return actionResultError(ErrorTypeEnum.GenericError, `Empty response body for: ${filepath}`);
      }

      const streamId = `s3-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const isText = encoding === 'text';
      const size = chunkSize ?? 65536;
      const transform = isText
        ? (buf: Buffer) => buf.toString('utf8')
        : (buf: Buffer) => buf.toString('base64');
      const iterator = chunkedReadableIterator(response.Body as Readable, size, transform);
      streamRegistry.register(streamId, iterator);

      return actionResult({ id: streamId, encoding });
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getFileStreamOpenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.StreamOpen]: getProcessFileStreamOpen(qpqConfig),
});
