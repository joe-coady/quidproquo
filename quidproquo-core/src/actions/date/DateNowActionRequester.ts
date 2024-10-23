import { DateActionType } from './DateActionType';
import { DateNowActionRequester } from './DateNowActionTypes';

export function* askDateNow(): DateNowActionRequester {
  return yield { type: DateActionType.Now };
}
