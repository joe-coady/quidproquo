import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { WindowActionType } from './WindowActionType';

// A plain, serializable copy of the browser `window.location`.
export type WindowLocation = {
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
};

// Payload
export type WindowGetLocationActionPayload = undefined;

// Action
export interface WindowGetLocationAction extends Action<WindowGetLocationActionPayload> {
  type: WindowActionType.GetLocation;
}

// Function Types
export type WindowGetLocationActionProcessor = ActionProcessor<WindowGetLocationAction, WindowLocation>;
export type WindowGetLocationActionRequester = ActionRequester<WindowGetLocationAction, WindowLocation>;
