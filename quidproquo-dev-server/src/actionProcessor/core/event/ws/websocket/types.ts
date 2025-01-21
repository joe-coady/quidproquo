import { MatchStoryResult } from 'quidproquo-core';
import { WebsocketEvent, WebsocketEventResponse } from 'quidproquo-webserver';

import { WsEvent } from '../../../../../implementations/webSocket';

// Externals - The ins and outs of the external event
export type EventInput = [WsEvent];
export type EventOutput = void;

// Internals - the ins and outs of each record in the event
export type InternalEventRecord = WebsocketEvent<string | Blob | ArrayBuffer>;
export type InternalEventOutput = WebsocketEventResponse;

export type MatchResult = MatchStoryResult<any, any>;
