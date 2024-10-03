import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types';
import { GraphCypherResponse } from '../../config';

export enum GraphDatabaseInstanceType {
  Read = 'read',
  Write = 'write',
}

// Payload
export interface GraphDatabaseExecuteOpenCypherQueryActionPayload {
  graphDatabaseName: string;
  openCypherQuery: string;
  params?: Record<string, any>;
  instance: GraphDatabaseInstanceType;
}

// Action
export interface GraphDatabaseExecuteOpenCypherQueryAction extends Action<GraphDatabaseExecuteOpenCypherQueryActionPayload> {
  type: GraphDatabaseActionType.ExecuteOpenCypherQuery;
  payload: GraphDatabaseExecuteOpenCypherQueryActionPayload;
}

// Function Types
export type GraphDatabaseExecuteOpenCypherQueryActionProcessor = ActionProcessor<GraphDatabaseExecuteOpenCypherQueryAction, GraphCypherResponse>;
export type GraphDatabaseExecuteOpenCypherQueryActionRequester = ActionRequester<GraphDatabaseExecuteOpenCypherQueryAction, GraphCypherResponse>;
