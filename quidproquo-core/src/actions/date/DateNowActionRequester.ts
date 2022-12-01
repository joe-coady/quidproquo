import { DateNowActionRequester } from './DateNowActionTypes';
import { DateActionType } from './DateActionType';

export function* askDateNow(): DateNowActionRequester {
  return yield { type: DateActionType.Now };
}
