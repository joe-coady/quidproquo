import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types';

export type GraphDatabaseEndpoints = {
  readEndpoint?: string;
  writeEndpoint?: string;
};

// Payload
export interface GraphDatabaseGetEndpointsActionPayload {
  graphDatabaseName: string;
}

// Action
export interface GraphDatabaseGetEndpointsAction extends Action<GraphDatabaseGetEndpointsActionPayload> {
  type: GraphDatabaseActionType.GetEndpoints;
  payload: GraphDatabaseGetEndpointsActionPayload;
}

// Function Types
export type GraphDatabaseGetEndpointsActionProcessor = ActionProcessor<GraphDatabaseGetEndpointsAction, GraphDatabaseEndpoints>;
export type GraphDatabaseGetEndpointsActionRequester = ActionRequester<GraphDatabaseGetEndpointsAction, GraphDatabaseEndpoints>;
