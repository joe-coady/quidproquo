import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { MathActionType } from './MathActionType';

// Payload
export interface MathRandomNumberActionPayload {}

// Action
export interface MathRandomNumberAction extends Action<MathRandomNumberActionPayload> {
  type: MathActionType.RandomNumber;
}

// Function Types
export type MathRandomNumberActionProcessor = ActionProcessor<MathRandomNumberAction, number>;
export type MathRandomNumberActionRequester = ActionRequester<MathRandomNumberAction, number>;
