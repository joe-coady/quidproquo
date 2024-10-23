import { LogLevelEnum } from '../../types/LogLevelEnum';
import { LogActionType } from './LogActionType';
import { LogCreateActionRequester } from './LogCreateActionTypes';

export function* askLogCreate(logLevel: LogLevelEnum, msg: string, data?: any): LogCreateActionRequester {
  return yield {
    type: LogActionType.Create,
    payload: {
      logLevel,
      msg,
      data,
    },
  };
}
