import { StoryResult, StoryResultMetadata } from 'quidproquo-core';
import {
  apiGenericTextExtractor,
  unknownGenericTextExtractor,
  queueEventGenericTextExtractor,
  serviceFunctionExeGenericTextExtractor,
} from './genericTextExtractors';

// These have to be strings and not enum due to how the lambda is packaged
const extractors: Record<string, (sr: StoryResult<any>) => string> = {
  ['API']: apiGenericTextExtractor,
  ['QUEUE_EVENT']: queueEventGenericTextExtractor,
  ['SERVICE_FUNCTION_EXE']: serviceFunctionExeGenericTextExtractor,

  ['RECURRING_SCHEDULE']: unknownGenericTextExtractor,
  ['EVENT_SEO_OR']: unknownGenericTextExtractor,
  ['EXECUTE_STORY']: unknownGenericTextExtractor,
};

export const storyResultToMetadata = (
  storyResult: StoryResult<any>,
  filepath: string,
): StoryResultMetadata => {
  // Add the generic text to the tag list
  const tags = [extractors[storyResult.runtimeType]?.(storyResult), ...storyResult.tags];

  // Base metadata
  const metadata: StoryResultMetadata = {
    correlation: storyResult.correlation,
    fromCorrelation: storyResult.fromCorrelation,
    moduleName: storyResult.moduleName,
    runtimeType: storyResult.runtimeType,
    startedAt: storyResult.startedAt,
    generic: tags.filter((t) => !!t).join(', '),
  };

  // Extract error text
  if (storyResult.error) {
    metadata.error = storyResult.error.errorText;
  }

  // Return the metadata
  return metadata;
};
