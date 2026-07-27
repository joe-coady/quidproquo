import { KvsQueryCondition, KvsQueryOperation } from 'quidproquo-core';

import { isKvsLogicalOperator } from './isKvsLogicalOperator';
import { isKvsQueryCondition } from './isKvsQueryCondition';

/** Flatten a query tree into its leaf conditions, in traversal order. */
export const flattenKvsQueryConditions = (query: KvsQueryOperation): KvsQueryCondition[] => {
  if (isKvsQueryCondition(query)) {
    return [query];
  }
  if (isKvsLogicalOperator(query)) {
    return query.conditions.flatMap(flattenKvsQueryConditions);
  }
  return [];
};
