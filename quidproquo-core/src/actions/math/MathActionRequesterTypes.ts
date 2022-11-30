import MathActionTypeEnum from './MathActionTypeEnum';
import { Action } from '../../types/Action';

export interface MathRandomNumberActionPayload {}

export interface MathRandomNumberAction extends Action {
  type: MathActionTypeEnum.RandomNumber;
  payload?: MathRandomNumberActionPayload;
}
