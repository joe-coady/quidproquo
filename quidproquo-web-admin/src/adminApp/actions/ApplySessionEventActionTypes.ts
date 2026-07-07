import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { AdminSessionEventType } from '../effects/session/AdminSessionEventType';
import { AdminSessionActionType } from './AdminSessionActionType';

// Payload
export type ApplySessionEventActionPayload = {
  type: AdminSessionEventType;
  data: unknown;
};

// Action
export interface ApplySessionEventAction extends Action<ApplySessionEventActionPayload> {
  type: AdminSessionActionType.applyEvent;
  payload: ApplySessionEventActionPayload;
}

// Function Types
export type ApplySessionEventActionProcessor = ActionProcessor<ApplySessionEventAction, void>;
export type ApplySessionEventActionRequester = ActionRequester<ApplySessionEventAction, void>;
