import { askKeyValueStoreScan, KvsQueryOperation } from '../../actions';
import { AskResponse, QpqPagedData } from '../../types';

export function* askKeyValueStoreScanAll<T>(storeName: string, filterCondition?: KvsQueryOperation): AskResponse<T[]> {
  const allData: T[] = [];
  let data: QpqPagedData<T> = {
    items: [],
  };

  do {
    data = yield* askKeyValueStoreScan<T>(storeName, filterCondition, data.nextPageKey);

    allData.push(...data.items);
  } while (data.nextPageKey);

  return allData;
}
