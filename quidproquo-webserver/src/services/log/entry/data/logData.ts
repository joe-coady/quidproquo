import { askFileReadObjectJson, askFileReadTextContents, AskResponse, StoryResult } from 'quidproquo-core';

const logStorageDriveName = 'qpq-logs';

export function* askGetByCorrelation(correlation: string): AskResponse<StoryResult<any>> {
  const storyResult = yield* askFileReadObjectJson<StoryResult<any>>(logStorageDriveName, `${correlation}.json`);
  return storyResult;
}
