import { LogActionType } from './LogActionType';
import { LogDisableEventHistoryActionRequester } from './LogDisableEventHistoryActionTypes';

export function* askLogDisableEventHistory(enable: boolean, reason: string): LogDisableEventHistoryActionRequester {
  return yield {
    type: LogActionType.DisableEventHistory,
    payload: {
      enable,
      reason,
    },
  };
}
