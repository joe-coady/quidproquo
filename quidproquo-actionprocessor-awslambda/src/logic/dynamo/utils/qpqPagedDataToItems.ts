import { stringToLastEvaluatedKey } from '../logs';

export const itemsToQpqPagedData = <T>(items: T[], lastEvaluatedKey?: string) => ({
  items,
  lastEvaluatedKey: lastEvaluatedKey && stringToLastEvaluatedKey(lastEvaluatedKey),
});
