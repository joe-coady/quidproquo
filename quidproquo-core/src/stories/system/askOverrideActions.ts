import { askBatch, askThrowError, SystemActionType, SystemBatchActionPayload } from '../../actions';
import { getSuccessfulEitherActionResult } from '../../logic/actionLogic';
import { Action, AskResponse, AskResponseReturnType, EitherActionResult } from '../../types';
import { askMap } from '../array/askMap';
import { askCatch } from './askCatch';

export type ActionOverrideHandler<TPayload = any, TResult = any> = (payload: TPayload) => AskResponse<TResult>;

export type ActionOverrideMap = {
  [actionType: string]: ActionOverrideHandler;
};

function* askProcessAction<R>(action: Action<any>): AskResponse<R> {
  return (yield action) as R;
}

function getSuccessfulEitherActionResultIfRequired<T, ReturnErrors extends boolean>(
  value: T,
  returnErrors?: ReturnErrors,
): ReturnErrors extends true ? EitherActionResult<T> : T {
  if (returnErrors) {
    return getSuccessfulEitherActionResult(value) as ReturnErrors extends true ? EitherActionResult<T> : T;
  } else {
    return value as ReturnErrors extends true ? EitherActionResult<T> : T;
  }
}

export function* askOverrideActions<T extends AskResponse<any>>(
  storyIterator: T,
  overrides: ActionOverrideMap,
): AskResponse<AskResponseReturnType<T>> {
  let nextResult = storyIterator.next();

  while (!nextResult.done) {
    const action = nextResult.value;

    // If this action type has an override handler
    if (overrides[action.type]) {
      const handler = overrides[action.type];
      const result = yield* handler(action.payload);

      nextResult = storyIterator.next(getSuccessfulEitherActionResultIfRequired(result, action.returnErrors));
      continue;
    }

    // If we have a batch that could contain overridden actions
    if (action.type === SystemActionType.Batch) {
      const batchActionPayload: SystemBatchActionPayload = action.payload;

      const batchActionsToRun = yield* askMap(batchActionPayload.actions, function* (batchAction) {
        const isOverridden = !!overrides[batchAction.type];

        return {
          action: batchAction,
          isOverridden,
          result: isOverridden ? yield* askOverrideActions(askProcessAction(batchAction), overrides) : undefined,
        };
      });

      const remainingBatchActionsToRun = batchActionsToRun.filter((ba) => !ba.isOverridden);

      const results = yield* askCatch(askBatch(remainingBatchActionsToRun.map((ba) => ba.action)));

      if (results.success) {
        remainingBatchActionsToRun.forEach((ba, index) => {
          ba.result = results.result[index];
        });
      }

      const allResults = batchActionsToRun.map((ba) => ba.result);

      if (!results.success) {
        if (!action.returnErrors) {
          return yield* askThrowError(results.error.errorType, results.error.errorText, results.error.errorStack);
        } else {
          nextResult = storyIterator.next(results);
        }
      } else {
        nextResult = storyIterator.next(getSuccessfulEitherActionResultIfRequired(allResults, action.returnErrors));
      }

      continue;
    }

    // Otherwise, yield the action up to the parent
    const actionValue = yield action;
    nextResult = storyIterator.next(actionValue);
  }

  return nextResult.value;
}
