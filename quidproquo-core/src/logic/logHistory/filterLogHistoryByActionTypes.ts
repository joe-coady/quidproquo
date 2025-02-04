import { ActionHistory } from '../../types';
import { isBatchAction } from '../actionValidators';

export function filterLogHistoryByActionTypes(history: ActionHistory<any>[], actionTypes: string[]): ActionHistory<any>[] {
  const result: ActionHistory<any>[] = [];

  function processHistory(histories: ActionHistory<any>[]) {
    for (const entry of histories) {
      const { act, startedAt, finishedAt, res } = entry;

      if (isBatchAction(act)) {
        // Create new ActionHistory entries for each nested action
        const nestedHistories = act.payload.actions.map((nestedAction) => {
          const newHistory: ActionHistory<any> = {
            act: nestedAction,
            res,
            startedAt,
            finishedAt,
          };

          return newHistory;
        });

        processHistory(nestedHistories);
      } else if (actionTypes.length == 0 || actionTypes.includes(act.type)) {
        result.push(entry);
      }
    }
  }

  processHistory(history);
  return result;
}
