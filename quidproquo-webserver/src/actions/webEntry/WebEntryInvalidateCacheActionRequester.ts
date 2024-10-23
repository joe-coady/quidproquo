import { WebEntryActionType } from './WebEntryActionType';
import { WebEntryInvalidateCacheActionRequester } from './WebEntryInvalidateCacheActionTypes';

export function* askWebEntryInvalidateCache(webEntryName: string, ...paths: string[]): WebEntryInvalidateCacheActionRequester {
  return yield {
    type: WebEntryActionType.InvalidateCache,
    payload: {
      webEntryName,
      paths,
    },
  };
}
