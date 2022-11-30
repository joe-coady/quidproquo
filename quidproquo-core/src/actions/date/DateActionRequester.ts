import DateActionTypeEnum from './DateActionTypeEnum';
import { ActionPayload } from '../../types/ActionPayload';

export interface DateNowActionPayload extends ActionPayload {
  type: DateActionTypeEnum.Now;
}

// Generator<
//  Thing you are giving to QPQ,
//  Thing the function returns to the regular logic,
//  the thing QPQ gives us
// >

// We give DateNowActionPayload to QPQ
// QPQ gives us back a string ('2022-11-30T11:49:19.768Z')
// Then we return the same string back to the calling method
export function* askDateNow(): Generator<DateNowActionPayload, string, string> {
  return yield { type: DateActionTypeEnum.Now };
}
