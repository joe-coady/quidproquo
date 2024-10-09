import { AnyGraphResult, AskResponse, ErrorTypeEnum, GraphScalarResult, askThrowError } from 'quidproquo-core';
import { AnyNeptuneResult } from '../types';
import { askConvertNeptuneNodeResultToGraphNodeResult } from './askConvertNeptuneNodeResultToGraphNodeResult';
import { askConvertNeptuneRelationshipResultToGraphRelationshipResult } from './askConvertNeptuneRelationshipResultToGraphRelationshipResult';
import { isNeptuneScalarResult, isNeptuneNodeResult, isNeptuneRelationshipResult } from './utils';

export function* askConvertAnyNeptuneResultToAnyGraphResult(anyNeptuneResult: AnyNeptuneResult): AskResponse<AnyGraphResult> {
  if (isNeptuneScalarResult(anyNeptuneResult)) {
    return anyNeptuneResult as GraphScalarResult;
  }

  if (isNeptuneNodeResult(anyNeptuneResult)) {
    return yield* askConvertNeptuneNodeResultToGraphNodeResult(anyNeptuneResult);
  }

  if (isNeptuneRelationshipResult(anyNeptuneResult)) {
    return yield* askConvertNeptuneRelationshipResultToGraphRelationshipResult(anyNeptuneResult);
  }

  return yield* askThrowError(ErrorTypeEnum.GenericError, 'Unable to convert neptune query result');
}
