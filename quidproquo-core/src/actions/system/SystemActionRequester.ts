// NOTE: System actions have no platform specific processors and/or requestors
// and therefore do not need to implement a SystemActionProcessor.ts

import SystemActionTypeEnum from "./SystemActionTypeEnum";

// TODO: fix typing
export function* askBatch(actions: Array<object>): Generator<any, Array<any>, Array<any>> {
  return yield { type: SystemActionTypeEnum.Batch, payload: { actions } };
}

// TODO: Make this faster?
// TODO: Type support
// Runs n number of stories in parallel
export function* askParallel(stories: Array<any>): Generator<any, any, any> {
  const itt = stories.map((s: any) => s[0](...s.slice(1)));
  let actions = itt.map((i: any) => i.next());
  let values: Array<any> = actions.map(a => a.value);

  while (true) {
    // Batch any actions that we have not processed yet
    const actionsToBatch = actions.map(a => !a.done ? a.value : null);
    
    // Only batch actions when there are some to batch
    // People may batch stories together that actually dont have actions in them!?
    if (actionsToBatch.filter(atb => !!atb).length) {
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
      return actions.map(a => a.value);
    }
  }  
}