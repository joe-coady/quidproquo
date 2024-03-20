import { SystemActionType, SystemBatchActionPayload, askBatch } from '../../actions';
import { ContextActionType, ContextReadActionPayload } from '../../actions/context';
import { askMap } from '../../stories';
import {
  Action,
  AskResponse,
  AskResponseReturnType,
  EitherActionResult,
  QpqContext,
  QpqContextIdentifier,
} from '../../types';

function* askProcessAction<R>(action: Action<any>): AskResponse<R> {
  return (yield action) as R;
}

export function* askContextProvideValue<R, T extends AskResponse<any>>(
  contextIdentifier: QpqContextIdentifier<R>,
  value: R,
  storyIterator: T,
): AskResponse<AskResponseReturnType<T>> {
  let nextResult = storyIterator.next();

  // We cache the context values because the parent can't change, unilateral dataflow
  // and we don't want to recompute the context values every time we are asked for them.
  // we dont want to hit the hit the owner of the context as it shows in the logs for no reason
  let cache: QpqContext<any> | null = null;

  while (!nextResult.done) {
    // If this action is a read context
    if (nextResult.value.type === ContextActionType.Read) {
      // and its trying to read from this context
      const contextActionItterator = nextResult as IteratorYieldResult<
        Action<ContextReadActionPayload<any>>
      >;
      if (
        contextActionItterator.value.payload!.contextIdentifier.uniqueName ===
        contextIdentifier.uniqueName
      ) {
        // then we feed it our value
        nextResult = storyIterator.next(value);

        // And keep processing
        continue;
      }
    }

    // If we are trying to list all context values
    else if (nextResult.value.type === ContextActionType.List) {
      // Update the cache
      if (cache === null) {
        // Grab the parent context values
        const parentContextValues = yield nextResult.value;

        // overide / attach our context value
        const allContextValues = {
          ...parentContextValues,
          [contextIdentifier.uniqueName]: value,
        };

        // Update the cache
        cache = allContextValues;
      }

      // pass in our chached context values
      nextResult = storyIterator.next(cache);

      // And keep processing
      continue;

      // We have a batch that could contain a context action :(
    } else if (nextResult.value.type === SystemActionType.Batch) {
      // Extract the batch action payload from the batch action
      const batchActionPayload: SystemBatchActionPayload = nextResult.value.payload;

      // Process each action in the batch using askMap
      const batchActionsToRun = yield* askMap(batchActionPayload.actions, function* (action) {
        // Check if the action is a context action (List or Read)
        const isContextAction = [ContextActionType.List, ContextActionType.Read].includes(
          action.type as ContextActionType,
        );

        // Return an object containing the action, isContextAction flag, and the result
        // If it's a context action, recursively call askContextProvideValue to process the action
        // and obtain the result; otherwise, set result to undefined
        return {
          action,
          isContextAction,
          result: isContextAction
            ? yield* askContextProvideValue(contextIdentifier, value, askProcessAction(action))
            : undefined,
        };
      });

      // Filter out the context actions from the batch actions
      const remainingBatchActionsToRun = batchActionsToRun.filter((ba) => !ba.isContextAction);

      // Run the remaining actions (non-context) in a normal batch
      const results = yield* askBatch(remainingBatchActionsToRun.map((ba) => ba.action));

      // Assign the results to the corresponding actions in the remainingBatchActionsToRun array
      remainingBatchActionsToRun.forEach((ba, index) => {
        ba.result = results[index];
      });

      // Create an array of all the results, including both context and non-context actions
      const allResults = batchActionsToRun.map((ba) => ba.result);

      // Pass the all results array back to the story iterator
      nextResult = storyIterator.next(allResults);

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
