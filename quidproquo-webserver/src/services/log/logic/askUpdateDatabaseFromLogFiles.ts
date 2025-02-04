import {
  ActionHistory,
  addMillisecondsToTDateIso,
  askCatch,
  askConfigGetGlobal,
  askDateNow,
  askFileReadObjectJson,
  askGetCurrentEpoch,
  askGetEpochStartTime,
  askMap,
  AskResponse,
  DecodedAccessToken,
  LogActionType,
  LogCreateActionPayload,
  QpqRuntimeType,
  StoryResult,
  UserDirectoryActionType,
  UserDirectorySetAccessTokenActionPayload,
} from 'quidproquo-core';

import { askUpsert as askUpsertLogLog } from '../entry/data/logLogData';
import * as logMetadataData from '../entry/data/logMetadataData';
import { LogLog, LogMetadata } from '../entry/domain';
import {
  apiGenericTextExtractor,
  AUTH_CREATE_AUTH_CHALLENGE_GenericTextExtractor,
  AUTH_DEFINE_AUTH_CHALLENGE_GenericTextExtractor,
  AUTH_VERIFY_AUTH_CHALLENGE_GenericTextExtractor,
  queueEventGenericTextExtractor,
  seoORGenericTextExtractor,
  serviceFunctionExeGenericTextExtractor,
  unknownGenericTextExtractor,
  webSocketEventGenericTextExtractor,
} from './genericTextExtractors';
import { askSendLogToAdmins } from './webSocket';

const extractors: Record<QpqRuntimeType, (sr: StoryResult<any>) => string> = {
  [QpqRuntimeType.API]: apiGenericTextExtractor,
  [QpqRuntimeType.QUEUE_EVENT]: queueEventGenericTextExtractor,
  [QpqRuntimeType.SERVICE_FUNCTION_EXE]: serviceFunctionExeGenericTextExtractor,

  [QpqRuntimeType.RECURRING_SCHEDULE]: unknownGenericTextExtractor,
  [QpqRuntimeType.EVENT_SEO_OR]: seoORGenericTextExtractor,
  [QpqRuntimeType.EXECUTE_STORY]: unknownGenericTextExtractor,
  [QpqRuntimeType.EXECUTE_IMPLEMENTATION_STORY]: unknownGenericTextExtractor,
  [QpqRuntimeType.SEND_EMAIL_EVENT]: unknownGenericTextExtractor,

  [QpqRuntimeType.AUTH_DEFINE_AUTH_CHALLENGE]: AUTH_DEFINE_AUTH_CHALLENGE_GenericTextExtractor,
  [QpqRuntimeType.AUTH_CREATE_AUTH_CHALLENGE]: AUTH_CREATE_AUTH_CHALLENGE_GenericTextExtractor,
  [QpqRuntimeType.AUTH_VERIFY_AUTH_CHALLENGE]: AUTH_VERIFY_AUTH_CHALLENGE_GenericTextExtractor,

  [QpqRuntimeType.WEBSOCKET_EVENT]: webSocketEventGenericTextExtractor,

  [QpqRuntimeType.DEPLOY_EVENT]: unknownGenericTextExtractor,

  [QpqRuntimeType.STORAGEDRIVE_EVENT]: unknownGenericTextExtractor,

  [QpqRuntimeType.CLOUD_FLARE_DEPLOY]: unknownGenericTextExtractor,

  [QpqRuntimeType.UNIT_TEST]: unknownGenericTextExtractor,
};

export const getDecodedAccessTokenFromSetAccessTokenActionInStoryResult = (storyResult: StoryResult<any>): DecodedAccessToken | undefined => {
  const actionPayload: ActionHistory<UserDirectorySetAccessTokenActionPayload, DecodedAccessToken> | undefined = storyResult.history.find(
    (h) => h.act.type === UserDirectoryActionType.SetAccessToken,
  );

  if (!actionPayload) {
    return undefined;
  }

  return actionPayload.res;
};

export const storyResultToMetadata = (storyResult: StoryResult<any>, ttl?: number): LogMetadata => {
  // Add the generic text to the tag list
  const tags = [extractors[storyResult.runtimeType]?.(storyResult), ...storyResult.tags];

  const decodedAccessToken = storyResult.session?.decodedAccessToken || getDecodedAccessTokenFromSetAccessTokenActionInStoryResult(storyResult);

  // Base metadata
  const metadata: LogMetadata = {
    correlation: storyResult.correlation,
    fromCorrelation: storyResult.fromCorrelation,
    moduleName: storyResult.moduleName,
    runtimeType: storyResult.runtimeType,
    startedAt: storyResult.startedAt,
    generic: tags.filter((t) => !!t).join(', '),
    executionTimeMs: new Date(storyResult.finishedAt).getTime() - new Date(storyResult.startedAt).getTime(),
    ttl,

    userInfo: decodedAccessToken?.username || decodedAccessToken?.userId,
  };

  // Extract error text
  if (storyResult.error) {
    metadata.error = storyResult.error.errorText;
    metadata.ttl = undefined;
  }

  // Return the metadata
  return metadata;
};

export function* askErrorReadingStoryResultToMetadata(correlation: string): AskResponse<LogMetadata> {
  // Add the generic text to the tag list
  const errorText = 'Error loading story result';
  const tags = [errorText];

  // Base metadata
  const metadata: LogMetadata = {
    correlation: correlation,
    moduleName: correlation.split('::')[0],
    runtimeType: QpqRuntimeType.EXECUTE_STORY,
    startedAt: yield* askDateNow(),
    generic: tags.filter((t) => !!t).join(', '),
    executionTimeMs: 0,

    error: errorText,
  };

  // Return the metadata
  return metadata;
}

export function* askGetLogRecordsFromStoryResult(result: StoryResult<any>): AskResponse<ActionHistory<LogCreateActionPayload, void>[]> {
  const logActions = result.history.filter((h) => h.act.type === LogActionType.Create);

  return logActions;
}

export function* askUpdateDatabaseFromLogFile(storageDriveName: string, filesPath: string, ttl?: number): AskResponse<void> {
  const logObj = yield* askCatch(askFileReadObjectJson<StoryResult<any>>(storageDriveName, filesPath));

  const metadata = logObj.success
    ? storyResultToMetadata(logObj.result, ttl)
    : yield* askErrorReadingStoryResultToMetadata(filesPath.split('.').slice(0, -1).join('.'));

  yield* logMetadataData.askUpsert(metadata);

  // Send errors to admins
  if (metadata.error || !logObj.success) {
    yield* askSendLogToAdmins(metadata);
  }

  if (!logObj.success) {
    return;
  }

  const logActionHistories = yield* askGetLogRecordsFromStoryResult(logObj.result);
  let currentTime = yield* askGetEpochStartTime();
  const logLogs = logActionHistories.map((lac, logIndex) => {
    const timestamp = lac.startedAt === currentTime ? addMillisecondsToTDateIso(lac.startedAt, 1) : lac.startedAt;

    const logLog: LogLog = {
      type: lac.act.payload!.logLevel,
      reason: lac.act.payload!.msg,
      fromCorrelation: logObj.result.correlation,
      module: logObj.result.moduleName,
      logIndex,
      timestamp,
    };

    currentTime = timestamp;

    return logLog;
  });

  yield* askMap(logLogs, askUpsertLogLog);
}

export function* askUpdateDatabaseFromLogFiles(storageDriveName: string, filesPaths: string[]): AskResponse<void> {
  const logRetentionDays = yield* askConfigGetGlobal<number | undefined>('qpq-log-retention-days');

  const ttl = logRetentionDays ? Math.floor((yield* askGetCurrentEpoch()) + logRetentionDays * 24 * 60 * 60) : undefined;

  yield* askMap(filesPaths, function* (filePath: string) {
    yield* askUpdateDatabaseFromLogFile(storageDriveName, filePath, ttl);
  });
}
