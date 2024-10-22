import { createErrorEnumForAction } from '../../types';
import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { GraphDatabaseInternalFieldNamesActionRequester } from './GraphDatabaseInternalFieldNamesActionTypes';

export const GraphDatabaseInternalFieldNamesErrorTypeEnum = createErrorEnumForAction(GraphDatabaseActionType.InternalFieldNames, []);

export function* askGraphDatabaseInternalFieldNames(): GraphDatabaseInternalFieldNamesActionRequester {
  return yield {
    type: GraphDatabaseActionType.InternalFieldNames,
  };
}
