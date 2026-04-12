import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  FileActionType,
  FileStreamOpenActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import * as fs from 'fs';
import { Readable } from 'stream';

import { FileStorageConfig } from './types';
import { resolveFilePath } from './utils';

async function* textStreamIterator(stream: Readable): AsyncIterableIterator<string> {
  for await (const chunk of stream) {
    yield typeof chunk === 'string' ? chunk : (chunk as Buffer).toString('utf8');
  }
}

async function* binaryStreamIterator(stream: Readable): AsyncIterableIterator<string> {
  for await (const chunk of stream) {
    const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer);
    yield buffer.toString('base64');
  }
}

const getProcessFileStreamOpen = (
  qpqConfig: QPQConfig,
  config: FileStorageConfig,
): FileStreamOpenActionProcessor => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ drive, filepath, encoding, chunkSize }, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    try {
      const fullPath = resolveFilePath(config, serviceName, drive, filepath);
      const isText = encoding === 'text';
      const highWaterMark = chunkSize ?? 65536;
      const readStream = fs.createReadStream(fullPath, isText ? { encoding: 'utf8', highWaterMark } : { highWaterMark });
      const streamId = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const iterator = isText ? textStreamIterator(readStream) : binaryStreamIterator(readStream);
      streamRegistry.register(streamId, iterator);

      return actionResult({ id: streamId, encoding });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return actionResultError(ErrorTypeEnum.NotFound, `File not found: ${filepath}`);
      }
      return actionResultError(ErrorTypeEnum.GenericError, `Error opening file stream: ${error.message}`);
    }
  };
};

export const getFileStreamOpenActionProcessor = (
  config: FileStorageConfig,
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.StreamOpen]: getProcessFileStreamOpen(qpqConfig, config),
});
