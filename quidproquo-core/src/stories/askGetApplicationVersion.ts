import { askConfigGetGlobal, askLogCreate } from '../actions';

import { askCatch } from './system/askCatch';

import { AskResponse } from '../types';
import { qpqApplicationVersionGlobal } from '../constants';

export function* askGetApplicationVersion(): AskResponse<null | string> {
  const version = yield* askCatch(askConfigGetGlobal<string>(qpqApplicationVersionGlobal));

  if (!version.success) {
    return null;
  }

  return version.result;
}
