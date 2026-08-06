import { Action, ActionProcessor, ActionRequester } from '../../types';
import { GraphDatabaseActionType } from './GraphDatabaseActionType';

export type GraphDatabaseInternalFieldNames = {
  internalId: string;
  internalLabel: string;
  internalType: string;
  internalStartNode: string;
  internalEndNode: string;
};

// Payload
export type GraphDatabaseInternalFieldNamesActionPayload = undefined;
