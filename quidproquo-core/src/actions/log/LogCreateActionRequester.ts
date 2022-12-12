import { LogCreateActionRequester } from './LogCreateActionTypes';
import { LogActionType } from './LogActionType';
import { LogLevelEnum } from '../../types/LogLevelEnum';

export function* askLogCreate(
  logLevel: LogLevelEnum,
  msg: string,
  data?: object,
): LogCreateActionRequester {
  return yield {
    type: LogActionType.Create,
    payload: {
      logLevel,
      msg,
      dataJson: JSON.stringify(data),
    },
  };
}
