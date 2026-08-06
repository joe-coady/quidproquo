import { GraphCypherResponse } from '../../config';
import { Action, ActionProcessor, ActionRequester } from '../../types';
import { GraphDatabaseActionType } from './GraphDatabaseActionType';

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
