import {
  AskResponse,
  QpqRuntimeType,
  StoryResult,
  askConfigGetGlobal,
  askFileReadTextContents,
  askMap,
  askGetCurrentEpoch,
} from 'quidproquo-core';
import { LogMetadata } from '../domain';

import {
  apiGenericTextExtractor,
  unknownGenericTextExtractor,
  queueEventGenericTextExtractor,
  serviceFunctionExeGenericTextExtractor,
} from './genericTextExtractors';

import * as logMetadataData from '../data/logMetadataData';

// These have to be strings and not enum due to how the lambda is packaged
const extractors: Record<QpqRuntimeType, (sr: StoryResult<any>) => string> = {
  [QpqRuntimeType.API]: apiGenericTextExtractor,
  [QpqRuntimeType.QUEUE_EVENT]: queueEventGenericTextExtractor,
  [QpqRuntimeType.SERVICE_FUNCTION_EXE]: serviceFunctionExeGenericTextExtractor,

  [QpqRuntimeType.RECURRING_SCHEDULE]: unknownGenericTextExtractor,
  [QpqRuntimeType.EVENT_SEO_OR]: unknownGenericTextExtractor,
  [QpqRuntimeType.EXECUTE_STORY]: unknownGenericTextExtractor,
  [QpqRuntimeType.SEND_EMAIL_EVENT]: unknownGenericTextExtractor,
  [QpqRuntimeType.WEBSOCKET_EVENT]: unknownGenericTextExtractor,

  [QpqRuntimeType.DEPLOY_EVENT]: unknownGenericTextExtractor,

  [QpqRuntimeType.STORAGEDRIVE_EVENT]: unknownGenericTextExtractor,

  [QpqRuntimeType.CLOUD_FLARE_DEPLOY]: unknownGenericTextExtractor,

  [QpqRuntimeType.UNIT_TEST]: unknownGenericTextExtractor,
};

export const storyResultToMetadata = (storyResult: StoryResult<any>, ttl?: number): LogMetadata => {
  // Add the generic text to the tag list
  const tags = [extractors[storyResult.runtimeType]?.(storyResult), ...storyResult.tags];

  // Base metadata
  const metadata: LogMetadata = {
    correlation: storyResult.correlation,
    fromCorrelation: storyResult.fromCorrelation,
    moduleName: storyResult.moduleName,
    runtimeType: storyResult.runtimeType,
    startedAt: storyResult.startedAt,
    generic: tags.filter((t) => !!t).join(', '),
    executionTimeMs:
      new Date(storyResult.finishedAt).getTime() - new Date(storyResult.startedAt).getTime(),
    ttl,
  };

  // Extract error text
  if (storyResult.error) {
    metadata.error = storyResult.error.errorText;
    metadata.ttl = undefined;
  }

  // Return the metadata
  return metadata;
};

export function* askUpdateDatabaseFromLogFile(
  storageDriveName: string,
  filesPath: string,
  ttl?: number,
): AskResponse<void> {
  const logFile = yield* askFileReadTextContents(storageDriveName, filesPath);
  const metadata = storyResultToMetadata(JSON.parse(logFile), ttl);

  yield* logMetadataData.askUpsert(metadata);
}

export function* askUpdateDatabaseFromLogFiles(
  storageDriveName: string,
  filesPaths: string[],
): AskResponse<void> {
  const logRetentionDays = yield* askConfigGetGlobal<number | undefined>('qpq-log-retention-days');

  const ttl = logRetentionDays
    ? Math.floor((yield* askGetCurrentEpoch()) + logRetentionDays * 24 * 60 * 60)
    : undefined;

  yield* askMap(filesPaths, function* (filePath: string) {
    yield* askUpdateDatabaseFromLogFile(storageDriveName, filePath, ttl);
  });
}
