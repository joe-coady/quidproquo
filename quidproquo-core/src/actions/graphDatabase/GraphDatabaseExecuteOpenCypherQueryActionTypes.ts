import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types';

// Payload
export interface GraphDatabaseExecuteOpenCypherQueryActionPayload {
  graphDatabaseName: string;
  openCypherQuery: string;
  params?: Record<string, any>;
}

// Action
export interface GraphDatabaseExecuteOpenCypherQueryAction extends Action<GraphDatabaseExecuteOpenCypherQueryActionPayload> {
  type: GraphDatabaseActionType.ExecuteOpenCypherQuery;
  payload: GraphDatabaseExecuteOpenCypherQueryActionPayload;
}

// Function Types
export type GraphDatabaseExecuteOpenCypherQueryActionProcessor = ActionProcessor<GraphDatabaseExecuteOpenCypherQueryAction, void>;
export type GraphDatabaseExecuteOpenCypherQueryActionRequester = ActionRequester<GraphDatabaseExecuteOpenCypherQueryAction, void>;
