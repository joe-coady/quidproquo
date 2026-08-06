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
