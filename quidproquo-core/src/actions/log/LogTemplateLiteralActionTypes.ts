import { DecomposedString } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { LogActionType } from './LogActionType';

// Payload
export interface LogTemplateLiteralActionPayload {
  messageParts: DecomposedString;
}

// Action
export interface LogTemplateLiteralAction extends Action<LogTemplateLiteralActionPayload> {
  type: LogActionType.TemplateLiteral;
  payload: LogTemplateLiteralActionPayload;
}

// Function Types
export type LogTemplateLiteralActionProcessor = ActionProcessor<LogTemplateLiteralAction, void>;
export type LogTemplateLiteralActionRequester = ActionRequester<LogTemplateLiteralAction, void>;
