import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { GraphDatabaseForNeptuneActionType } from './GraphDatabaseForNeptuneActionType';

export type GraphDatabaseEndpoints = {
  readEndpoint?: string;
  writeEndpoint?: string;
};

// Payload
export interface GraphDatabaseForNeptuneGetEndpointsActionPayload {
  graphDatabaseName: string;
}

// Action
export interface GraphDatabaseForNeptuneGetEndpointsAction extends Action<GraphDatabaseForNeptuneGetEndpointsActionPayload> {
  type: GraphDatabaseForNeptuneActionType.GetEndpoints;
  payload: GraphDatabaseForNeptuneGetEndpointsActionPayload;
}

// Function Types
export type GraphDatabaseForNeptuneGetEndpointsActionProcessor = ActionProcessor<GraphDatabaseForNeptuneGetEndpointsAction, GraphDatabaseEndpoints>;
export type GraphDatabaseForNeptuneGetEndpointsActionRequester = ActionRequester<GraphDatabaseForNeptuneGetEndpointsAction, GraphDatabaseEndpoints>;
