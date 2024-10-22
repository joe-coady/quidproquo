import { WebEntryInvalidateCacheActionRequester } from './WebEntryInvalidateCacheActionTypes';
import { WebEntryActionType } from './WebEntryActionType';

export function* askWebEntryInvalidateCache(webEntryName: string, ...paths: string[]): WebEntryInvalidateCacheActionRequester {
  return yield {
    type: WebEntryActionType.InvalidateCache,
    payload: {
      webEntryName,
      paths,
    },
  };
}
