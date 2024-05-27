import { SeoEvent, SeoEventResponse, SeoEventRouteParams, SeoQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { CloudFrontRequestEvent, Context, CloudFrontRequestResult } from 'aws-lambda';
import { MatchStoryResult } from 'quidproquo-core';

// Externals - The ins and outs of the external event
export type EventInput = [CloudFrontRequestEvent, Context];
export type EventOutput = CloudFrontRequestResult;

// Internals - the ins and outs of each record in the event
export type InternalEventRecord = SeoEvent<any>;
export type InternalEventOutput = SeoEventResponse;

// Match result - the result of matching the event to a story
export type MatchResult = MatchStoryResult<SeoEventRouteParams, SeoQPQWebServerConfigSetting>;
