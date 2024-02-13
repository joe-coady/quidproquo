// NOTE: System actions have no platform specific processors and/or requestors
// and therefore do not need to implement a SystemActionProcessor.ts

import { askBatch } from './SystemBatchActionRequester';
import { SystemRunParallelActionRequester } from './SystemRunParallelActionTypes';

/**
 * @deprecated since version X.X. Please use {@link askRunParallel} instead.
 * Runs n number of stories in parallel. This function is deprecated and has been replaced
 * by a more efficient and type-supported version. The replacement function provides
 * improved performance and better type support.
 *
 * @param {Array<any>} stories - An array of stories to be run in parallel.
 * @returns {SystemRunParallelActionRequester} A requester for running actions in parallel.
 */
export function* askParallelDEPRECATED(stories: Array<any>): SystemRunParallelActionRequester {
  const itt = stories.map((s: any) => s[0](...s.slice(1)));
  let actions = itt.map((i: any) => i.next());
  let values: Array<any> = actions.map((a) => a.value);

  while (true) {
    // Batch any actions that we have not processed yet
    const actionsToBatch = actions.map((a) => (!a.done ? a.value : null));

    // Only batch actions when there are some to batch
    // People may batch stories together that actually dont have actions in them!?
    if (actionsToBatch.filter((atb) => !!atb).length) {
      values = yield* askBatch(actionsToBatch);
    }

    // Calculate real values
    let done = true;
    for (var i = 0; i < stories.length; i++) {
      if (!actions[i].done) {
        actions[i] = itt[i].next(values[i]);
        if (!actions[i].done) {
          done = false;
        }
      }
    }

    if (done) {
      return actions.map((a) => a.value);
    }
  }
}
