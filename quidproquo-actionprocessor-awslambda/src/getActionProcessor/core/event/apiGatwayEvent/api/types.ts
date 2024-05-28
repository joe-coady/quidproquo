import { HTTPEvent, HTTPEventResponse } from 'quidproquo-webserver';

import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { MatchStoryResult } from 'quidproquo-core';

export type AnyHTTPEvent = HTTPEvent<any>;
export type AnyHTTPEventResponse = HTTPEventResponse<any>;

// Externals - The ins and outs of the external event
export type EventInput = [APIGatewayEvent, Context];
export type EventOutput = APIGatewayProxyResult;

// Internals - the ins and outs of each record in the event
export type InternalEventRecord = AnyHTTPEvent;
export type InternalEventOutput = AnyHTTPEventResponse;

export type MatchResult = MatchStoryResult<any, any>;
