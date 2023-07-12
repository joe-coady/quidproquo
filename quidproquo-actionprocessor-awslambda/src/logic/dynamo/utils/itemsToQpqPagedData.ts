import { lastEvaluatedKeyToString } from '../logs';
import { QpqPagedData } from 'quidproquo-core';

export const itemsToQpqPagedData = <T>(items: T[], lastEvaluatedKey?: any): QpqPagedData<T> => ({
  items,
  nextPageKey: lastEvaluatedKey ? lastEvaluatedKeyToString(lastEvaluatedKey) : undefined,
});
