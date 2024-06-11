import { SystemActionType } from '../../actions';
import { Action, AskResponse, AskResponseReturnType } from '../../types';

export function* askRemoveBatch<T extends AskResponse<any>>(storyIterator: T): AskResponse<AskResponseReturnType<T>> {
  let nextResult = storyIterator.next();

  while (!nextResult.done) {
    const actionToRun = nextResult.value;

    if (actionToRun.type !== SystemActionType.Batch) {
      // Add returnErrors to the action, so we can "catch" errors
      const rawResponse = yield actionToRun;
      nextResult = storyIterator.next(rawResponse);
      continue;
    }

    // TODO: This part :/ ~ We need to recursivly flatten out all actions from batches, you can have batches of batches
    // and remember to deal with the returnErrors and such...
    const rawResponse = yield actionToRun;
    nextResult = storyIterator.next(rawResponse);
    continue;
  }

  // Return the successful final result of the generator
  return nextResult.value;
}
