import { askFileReadObjectJson, askFileReadTextContents, AskResponse, QPQ_LOGS_STORAGE_DRIVE_NAME, StoryResult } from 'quidproquo-core';

export function* askGetByCorrelation(correlation: string): AskResponse<StoryResult<any>> {
  const storyResult = yield* askFileReadObjectJson<StoryResult<any>>(QPQ_LOGS_STORAGE_DRIVE_NAME, `${correlation}.json`);
  return storyResult;
}
