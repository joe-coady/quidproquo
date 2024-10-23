import { QpqPagedData } from 'quidproquo-core';

import { lastEvaluatedKeyToString } from '../logs';

export const itemsToQpqPagedData = <T>(items: T[], lastEvaluatedKey?: any): QpqPagedData<T> => ({
  items,
  nextPageKey: lastEvaluatedKey ? lastEvaluatedKeyToString(lastEvaluatedKey) : undefined,
});
