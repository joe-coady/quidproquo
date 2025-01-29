import { askBatch, askThrowError, SystemActionType, SystemBatchActionPayload } from '../../actions';
import { ContextActionType, ContextReadActionPayload } from '../../actions/context';
import { getSuccessfulEitherActionResult } from '../../logic/actionLogic';
import { askCatch, askMap } from '../../stories';
import { Action, AskResponse, AskResponseReturnType, EitherActionResult, QpqContext, QpqContextIdentifier } from '../../types';

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
    // Explicitly return T when returnErrors is false
    return value as ReturnErrors extends true ? EitherActionResult<T> : T;
  }
}

export function* askContextProvideValue<R, T extends AskResponse<any>>(
  contextIdentifier: QpqContextIdentifier<R>,
  value: R,
  storyIterator: T,
): AskResponse<AskResponseReturnType<T>> {
  let nextResult = storyIterator.next();

  // We cache the context values because the parent can't change, unilateral dataflow
  // and we don't want to recompute the context values every time we are asked for them.
  // we dont want to hit the owner of the context as it shows in the logs for no reason
  let cache: QpqContext<any> | null = null;

  while (!nextResult.done) {
    // If this action is a read context
    if (nextResult.value.type === ContextActionType.Read) {
      // and its trying to read from this context
      const contextActionItterator = nextResult as IteratorYieldResult<Action<ContextReadActionPayload<any>>>;

      if (contextActionItterator.value.payload!.contextIdentifier.uniqueName === contextIdentifier.uniqueName) {
        // then we feed it our value - remember to send it back as an either result if needed
        nextResult = storyIterator.next(getSuccessfulEitherActionResultIfRequired(value, contextActionItterator.value.returnErrors));

        // And keep processing
        continue;
      }
    }

    // If we are trying to list all context values
    else if (nextResult.value.type === ContextActionType.List) {
      // Update the cache
      if (cache === null) {
        // Grab the parent context values, always grab a either result
        const parentContextValues: EitherActionResult<QpqContext<any>> = yield {
          ...nextResult.value,
          returnErrors: true,
        };

        // overide / attach our context value
        const allContextValues: QpqContext<any> = {
          ...(parentContextValues.result || {}),
          [contextIdentifier.uniqueName]: value,
        };

        // Update the cache
        cache = allContextValues;
      }

      // pass in our chached context values
      nextResult = storyIterator.next(getSuccessfulEitherActionResultIfRequired(cache, nextResult.value.returnErrors));

      // And keep processing
      continue;

      // We have a batch that could contain a context action :(
    } else if (nextResult.value.type === SystemActionType.Batch) {
      // Extract the batch action payload from the batch action
      const batchActionPayload: SystemBatchActionPayload = nextResult.value.payload;

      // Process each action in the batch using askMap
      const batchActionsToRun = yield* askMap(batchActionPayload.actions, function* (action) {
        // Check if the action is a context action (List or Read)
        const isContextAction = [ContextActionType.List, ContextActionType.Read].includes(action.type as ContextActionType);

        // Return an object containing the action, isContextAction flag, and the result
        // If it's a context action, recursively call askContextProvideValue to process the action
        // and obtain the result; otherwise, set result to undefined
        return {
          action,
          isContextAction,
          result: isContextAction ? yield* askContextProvideValue(contextIdentifier, value, askProcessAction(action)) : undefined,
        };
      });

      // Filter out the context actions from the batch actions
      const remainingBatchActionsToRun = batchActionsToRun.filter((ba) => !ba.isContextAction);

      // Run the remaining actions (non-context) in a normal batch
      // TODO: This needs to be wrapped in an ask catch
      // and have the error passed back based on the original [nextResult.value.returnErrors]
      const results = yield* askCatch(askBatch(remainingBatchActionsToRun.map((ba) => ba.action)));

      if (results.success) {
        // Assign the results to the corresponding actions in the remainingBatchActionsToRun array
        remainingBatchActionsToRun.forEach((ba, index) => {
          ba.result = results.result[index];
        });
      }

      // Create an array of all the results, including both context and non-context actions
      const allResults = batchActionsToRun.map((ba) => ba.result);

      // If we errored the batch
      if (!results.success) {
        if (!nextResult.value.returnErrors) {
          return yield* askThrowError(results.error.errorType, results.error.errorText, results.error.errorStack);
        } else {
          nextResult = storyIterator.next(results);
        }
      } else {
        // Pass the all results array back to the story iterator
        nextResult = storyIterator.next(getSuccessfulEitherActionResultIfRequired(allResults, nextResult.value.returnErrors));
      }

      // Continue processing the next action in the story iterator
      continue;
    }

    // Otherwise this is not a context action
    // use the parent processor to process it.
    const actionValue = yield nextResult.value;

    // and pass that value down to our children.
    nextResult = storyIterator.next(actionValue);
  }

  // Return the successful final result of the generator
  return nextResult.value;
}
