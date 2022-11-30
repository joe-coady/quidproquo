import DateActionTypeEnum from './DateActionTypeEnum';
import { Action } from '../../types/Action';

export interface DateNowActionPayload {}

export interface DateNowAction extends Action {
  type: DateActionTypeEnum.Now;
  payload?: DateNowActionPayload;
}
