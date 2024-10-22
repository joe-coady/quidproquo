import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types';

type GraphDatabaseInternalFieldNames = {
  internalId: string;
  internalLabel: string;
  internalType: string;
  internalStartNode: string;
  internalEndNode: string;
};

// Payload
export type GraphDatabaseInternalFieldNamesActionPayload = undefined;

// Action
export interface GraphDatabaseInternalFieldNamesAction extends Action<GraphDatabaseInternalFieldNamesActionPayload> {
  type: GraphDatabaseActionType.InternalFieldNames;
}

// Function Types
export type GraphDatabaseInternalFieldNamesActionProcessor = ActionProcessor<GraphDatabaseInternalFieldNamesAction, GraphDatabaseInternalFieldNames>;
export type GraphDatabaseInternalFieldNamesActionRequester = ActionRequester<GraphDatabaseInternalFieldNamesAction, GraphDatabaseInternalFieldNames>;
