import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';
import { OpenApiSpecActionType } from './OpenApiSpecActionType';

// Payload
export interface OpenApiSpecGetOpenApiSpecActionPayload {}

// Action
export interface OpenApiSpecGetOpenApiSpecAction extends Action<OpenApiSpecGetOpenApiSpecActionPayload> {
  type: OpenApiSpecActionType.GetOpenApiSpec;
}

// Function Types
export type OpenApiSpecGetOpenApiSpecActionProcessor = ActionProcessor<OpenApiSpecGetOpenApiSpecAction, string>;
export type OpenApiSpecGetOpenApiSpecActionRequester = ActionRequester<OpenApiSpecGetOpenApiSpecAction, string>;
