import { Action, ActionProcessor, ActionRequester, ContextListAction, QpqContext } from 'quidproquo-core';

import { DnsActionType } from './DnsActionType';

// Payload
export interface DnsListActionPayload {}

// Action
export interface DnsListAction extends Action<DnsListActionPayload> {
  type: DnsActionType.List;
}

// Function Types
export type DnsListActionProcessor = ActionProcessor<DnsListAction, string[]>;
export type DnsListActionRequester = ActionRequester<DnsListAction, string[]>;
