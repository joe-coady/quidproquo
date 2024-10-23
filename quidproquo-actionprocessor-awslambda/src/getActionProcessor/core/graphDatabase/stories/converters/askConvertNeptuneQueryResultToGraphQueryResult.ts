import { AnyGraphResult, askReduce,AskResponse, GraphQueryResult } from 'quidproquo-core';

import { AnyNeptuneResult, NeptuneQueryResult } from '../types';
import { askConvertAnyNeptuneResultToAnyGraphResult } from './askConvertAnyNeptuneResultToAnyGraphResult';

export function* askConvertNeptuneQueryResultToGraphQueryResult(neptuneQueryResult: NeptuneQueryResult): AskResponse<GraphQueryResult> {
  return yield* askReduce(Object.keys(neptuneQueryResult), {} as GraphQueryResult, function* askConvertKeyValue(acc, key, index) {
    return {
      ...acc,
      [key]: yield* askConvertAnyNeptuneResultToAnyGraphResult(neptuneQueryResult[key]),
    };
  });
}
