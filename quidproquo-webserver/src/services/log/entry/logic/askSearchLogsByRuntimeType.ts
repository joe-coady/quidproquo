import { AskResponse, QpqRuntimeType, StoryResult, askFileReadTextContents, askMap } from "quidproquo-core";
import { LogMetadata } from "../domain";

import {
    apiGenericTextExtractor,
    unknownGenericTextExtractor,
    queueEventGenericTextExtractor,
    serviceFunctionExeGenericTextExtractor,
  } from './genericTextExtractors';
  
  import * as logMetadataData from "../data/logMetadataData";

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
  };

export const storyResultToMetadata = (
    storyResult: StoryResult<any>
  ): LogMetadata => {
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
      executionTimeMs: new Date(storyResult.finishedAt).getTime() - new Date(storyResult.startedAt).getTime(),
    };
  
    // Extract error text
    if (storyResult.error) {
      metadata.error = storyResult.error.errorText;
    }
  
    // Return the metadata
    return metadata;
  };

export function* askUpdateDatabaseFromLogFile(storageDriveName: string, filesPath: string): AskResponse<void> {
    const logFile = yield* askFileReadTextContents(storageDriveName, filesPath);
    const metadata = storyResultToMetadata(JSON.parse(logFile));

    yield* logMetadataData.askUpsert(metadata);
}

export function* askUpdateDatabaseFromLogFiles(storageDriveName: string, filesPaths: string[]): AskResponse<void> {
    yield* askMap(filesPaths, function* (filePath: string) {
        yield* askUpdateDatabaseFromLogFile(storageDriveName, filePath);
    });
}