import { KeyValueStoreQPQConfigSetting, QpqPagedData } from 'quidproquo-core';

// Items are held in memory with their native JS types (a numeric sort key is a
// real `number`, not a stringified column), so plain `<`/`>` already orders
// numeric and string keys correctly - no separate numeric-vs-lexical branch
// needed, unlike the sqlite engine's CAST(sk AS REAL).
export const getPk = (item: any, storeConfig: KeyValueStoreQPQConfigSetting): any => item[storeConfig.partitionKey.key];

export const getSk = (item: any, storeConfig: KeyValueStoreQPQConfigSetting): any =>
  storeConfig.sortKeys.length > 0 ? item[storeConfig.sortKeys[0].key] : null;

const compareValues = (a: any, b: any): number => {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};

export const compareKvsItemKeys = (aPk: any, aSk: any, bPk: any, bSk: any): number => {
  const pkCmp = compareValues(aPk, bPk);
  return pkCmp !== 0 ? pkCmp : compareValues(aSk, bSk);
};

interface KvsPageCursor {
  pk: any;
  sk: any;
}

const decodeCursor = (nextPageKey: string): KvsPageCursor => JSON.parse(Buffer.from(nextPageKey, 'base64').toString());

const encodeCursor = (item: any, storeConfig: KeyValueStoreQPQConfigSetting): string =>
  Buffer.from(JSON.stringify({ pk: getPk(item, storeConfig), sk: getSk(item, storeConfig) } as KvsPageCursor)).toString('base64');

// Sorts by pk then sk (ascending or descending) and applies opaque base64
// {pk, sk} cursor pagination, fetching one extra row to detect `hasMore` -
// same cursor format and limit+1 detection as SqliteKvsRepository.
export const paginateKvsItems = (
  items: any[],
  storeConfig: KeyValueStoreQPQConfigSetting,
  sortAscending: boolean,
  nextPageKey?: string,
  limit?: number,
): QpqPagedData<any> => {
  const sorted = [...items].sort((a, b) => {
    const cmp = compareKvsItemKeys(getPk(a, storeConfig), getSk(a, storeConfig), getPk(b, storeConfig), getSk(b, storeConfig));
    return sortAscending ? cmp : -cmp;
  });

  const cursor = nextPageKey ? decodeCursor(nextPageKey) : undefined;
  const afterCursor = cursor
    ? sorted.filter((item) => {
        const cmp = compareKvsItemKeys(getPk(item, storeConfig), getSk(item, storeConfig), cursor.pk, cursor.sk);
        return sortAscending ? cmp > 0 : cmp < 0;
      })
    : sorted;

  const pageSize = limit || 100;
  const page = afterCursor.slice(0, pageSize + 1);
  const hasMore = page.length > pageSize;
  const resultItems = page.slice(0, pageSize);

  return {
    items: resultItems,
    nextPageKey: hasMore ? encodeCursor(resultItems[resultItems.length - 1], storeConfig) : undefined,
  };
};
