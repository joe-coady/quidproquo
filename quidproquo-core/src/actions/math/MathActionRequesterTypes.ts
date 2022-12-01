import MathActionTypeEnum from './MathActionTypeEnum';
import { Action } from '../../types/Action';

export interface MathRandomNumberActionPayload {}

export interface MathRandomNumberAction extends Action<MathRandomNumberActionPayload> {
  type: MathActionTypeEnum.RandomNumber;
}
