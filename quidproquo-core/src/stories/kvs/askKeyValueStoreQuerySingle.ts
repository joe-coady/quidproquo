import { KvsQueryOperation, askKeyValueStoreQuery } from '../../actions';
import { AskResponse, QpqPagedData } from '../../types';

export function* askKeyValueStoreQuerySingle<T>(
  keyValueStoreName: string,
  keyCondition: KvsQueryOperation,
  filter?: KvsQueryOperation,
  sortAscending?: boolean,
  limit = 1,
): AskResponse<T | null> {
  const allData: T[] = [];
  let data: QpqPagedData<T> = {
    items: [],
  };

  // filters apply AFTER you get the limit of the data so do pagination
  do {
    data = yield* askKeyValueStoreQuery<T>(keyValueStoreName, keyCondition, {
      filter,
      limit,
      sortAscending,
      nextPageKey: data.nextPageKey,
    });

    allData.push(...data.items);
  } while (data.nextPageKey && allData.length < limit);

  // Return the first item if available, otherwise return null
  return data.items.length > 0 ? data.items[0] : null;
}
