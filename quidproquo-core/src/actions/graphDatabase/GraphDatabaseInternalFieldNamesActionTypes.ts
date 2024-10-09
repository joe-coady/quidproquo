import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types';
import { GraphCypherResponse } from '../../config';

type GraphDatabaseInternalFieldNames = {
  internalId: string;
  internalLabel: string;
  internalType: string;
  internalStartNode: string;
  internalEndNode: string;
};

// Payload
export interface GraphDatabaseInternalFieldNamesActionPayload {}

// Action
export interface GraphDatabaseInternalFieldNamesAction extends Action<GraphDatabaseInternalFieldNamesActionPayload> {
  type: GraphDatabaseActionType.InternalFieldNames;
}

// Function Types
export type GraphDatabaseInternalFieldNamesActionProcessor = ActionProcessor<GraphDatabaseInternalFieldNamesAction, GraphDatabaseInternalFieldNames>;
export type GraphDatabaseInternalFieldNamesActionRequester = ActionRequester<GraphDatabaseInternalFieldNamesAction, GraphDatabaseInternalFieldNames>;
