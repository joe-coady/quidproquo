import {
  AskResponse,
  QpqRuntimeType,
  StoryResult,
  askConfigGetGlobal,
  askFileReadTextContents,
  askMap,
  askGetCurrentEpoch,
  UserDirectoryActionType,
  ActionHistory,
} from 'quidproquo-core';
import { LogMetadata } from '../entry/domain';
import { decodeJWT } from '../../../utils';

import {
  apiGenericTextExtractor,
  unknownGenericTextExtractor,
  queueEventGenericTextExtractor,
  serviceFunctionExeGenericTextExtractor,
  seoORGenericTextExtractor,
  webSocketEventGenericTextExtractor,
  AUTH_DEFINE_AUTH_CHALLENGE_GenericTextExtractor,
  AUTH_CREATE_AUTH_CHALLENGE_GenericTextExtractor,
  AUTH_VERIFY_AUTH_CHALLENGE_GenericTextExtractor,
} from './genericTextExtractors';

import * as logMetadataData from '../entry/data/logMetadataData';
import { askSendLogToAdmins } from './webSocket';

const extractors: Record<QpqRuntimeType, (sr: StoryResult<any>) => string> = {
  [QpqRuntimeType.API]: apiGenericTextExtractor,
  [QpqRuntimeType.QUEUE_EVENT]: queueEventGenericTextExtractor,
  [QpqRuntimeType.SERVICE_FUNCTION_EXE]: serviceFunctionExeGenericTextExtractor,

  [QpqRuntimeType.RECURRING_SCHEDULE]: unknownGenericTextExtractor,
  [QpqRuntimeType.EVENT_SEO_OR]: seoORGenericTextExtractor,
  [QpqRuntimeType.EXECUTE_STORY]: unknownGenericTextExtractor,
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

export const getAccessTokenFromSetAccessTokenActionInStoryResult = (storyResult: StoryResult<any>): string | undefined => {
  const actionPayload: ActionHistory | undefined = storyResult.history.find((h) => h.act.type === UserDirectoryActionType.SetAccessToken);

  return actionPayload?.act.payload?.accessToken;
};

export const storyResultToMetadata = (storyResult: StoryResult<any>, ttl?: number): LogMetadata => {
  // Add the generic text to the tag list
  const tags = [extractors[storyResult.runtimeType]?.(storyResult), ...storyResult.tags];

  const accessToken = storyResult.session?.accessToken || getAccessTokenFromSetAccessTokenActionInStoryResult(storyResult);

  const decodedToken = accessToken ? decodeJWT<{ sub?: string; userId?: string; username?: string; id?: string }>(accessToken) : null;

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

    // TODO: This is kinda not generic... but it's the best we can do for now
    // we need to update this to be username or userid once we remove the access token from the session.
    userInfo: decodedToken?.username || decodedToken?.userId || decodedToken?.sub || decodedToken?.id,
  };

  // Extract error text
  if (storyResult.error) {
    metadata.error = storyResult.error.errorText;
    metadata.ttl = undefined;
  }

  // Return the metadata
  return metadata;
};

export function* askUpdateDatabaseFromLogFile(storageDriveName: string, filesPath: string, ttl?: number): AskResponse<void> {
  const logFile = yield* askFileReadTextContents(storageDriveName, filesPath);
  const metadata = storyResultToMetadata(JSON.parse(logFile), ttl);

  yield* logMetadataData.askUpsert(metadata);

  // Send errors to admins
  if (!!metadata.error) {
    yield* askSendLogToAdmins(metadata);
  }
}

export function* askUpdateDatabaseFromLogFiles(storageDriveName: string, filesPaths: string[]): AskResponse<void> {
  const logRetentionDays = yield* askConfigGetGlobal<number | undefined>('qpq-log-retention-days');

  const ttl = logRetentionDays ? Math.floor((yield* askGetCurrentEpoch()) + logRetentionDays * 24 * 60 * 60) : undefined;

  yield* askMap(filesPaths, function* (filePath: string) {
    yield* askUpdateDatabaseFromLogFile(storageDriveName, filePath, ttl);
  });
}
