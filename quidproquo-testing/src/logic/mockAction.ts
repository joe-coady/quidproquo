import {
  AskResponseReturnType,
  ActionProcessorResult,
  actionResult,
  QpqCoreActionsRequesterTypeMap,
  ActionRequester,
  actionResultError,
  QPQError,
  AskResponseYieldType,
  isErroredActionResult,
  SystemActionType,
  SystemActionRequesterTypeMap,
  resolveActionResult,
  ConfigActionRequesterTypeMap,
  ConfigActionType,
  SystemBatchActionPayload,
  Action,
} from 'quidproquo-core';

export type AnyActionRequester = ActionRequester<any, any>;
export type AnyActionRequesterTypeMap = { [key: string]: AnyActionRequester };

export type AllQpqActionsRequesterTypeMap = QpqCoreActionsRequesterTypeMap;

// Define the QpqActionMock type
export type QpqActionMock<T extends AnyActionRequesterTypeMap, K extends keyof T> = {
  type: K;
  res: ActionProcessorResult<AskResponseReturnType<T[K]>>;
  input?: AskResponseYieldType<T[K]>['payload'];
  testInput: boolean;
};

// Define the mockQpqAction function
export function mockQpqAction<K extends keyof T, T extends AnyActionRequesterTypeMap = AllQpqActionsRequesterTypeMap>(
  type: K,
  res: AskResponseReturnType<T[K]>,
  payload?: AskResponseYieldType<T[K]>['payload'],
): QpqActionMock<T, K> {
  return {
    type,
    res: actionResult(res),
    input: payload,
    testInput: payload !== undefined,
  };
}

export function mockQpqActionError<K extends keyof T, T extends AnyActionRequesterTypeMap = AllQpqActionsRequesterTypeMap>(
  type: K,
  err: QPQError,
  payload?: AskResponseYieldType<T[K]>['payload'],
): QpqActionMock<T, K> {
  return {
    type,
    res: actionResultError(err.errorType, err.errorText, err.errorStack),
    input: payload,
    testInput: payload !== undefined,
  };
}

export function mockQpqBatchAction<
  K extends keyof T,
  T extends AnyActionRequesterTypeMap & SystemActionRequesterTypeMap = AllQpqActionsRequesterTypeMap,
>(mockActions: QpqActionMock<T, K>[]): QpqActionMock<T, SystemActionType.Batch> {
  if (mockActions.length === 1) {
    return mockActions[0] as QpqActionMock<T, SystemActionType.Batch>;
  }

  const foundError = mockActions.find((a) => isErroredActionResult(a.res));
  // If a batch errors, it just throws the first errored result
  if (foundError) {
    return {
      type: SystemActionType.Batch,
      res: foundError.res,
      testInput: false,
    };
  }

  const batchInput: SystemBatchActionPayload = {
    actions: mockActions.map((a) => {
      const action: Action<any> = {
        type: a.type as string,
        payload: a.input,
      };

      return action;
    }),
  };

  const mockedBatchAction: QpqActionMock<SystemActionRequesterTypeMap, SystemActionType.Batch> = {
    type: SystemActionType.Batch,
    res: actionResult(mockActions.map((ma) => resolveActionResult(ma.res))) as any, // Not sure why the types not working here...
    testInput: mockActions.every((a) => !!a.input),
    input: batchInput,
  };

  return mockedBatchAction;
}

// const m = mockQpqAction(ConfigActionType.GetParameter, 'res-api-key-1', {
//   parameterName: 'joe',
// });

// const b = mockQpqBatchAction([
//   mockQpqAction(ConfigActionType.GetParameter, 'res-api-key-1', {
//     parameterName: 'joe',
//   }),
// ]);
