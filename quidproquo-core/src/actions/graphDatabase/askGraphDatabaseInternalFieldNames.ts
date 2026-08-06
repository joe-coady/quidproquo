import { createActionRequester } from '../../types';
import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { GraphDatabaseInternalFieldNames } from './GraphDatabaseInternalFieldNamesActionTypes';

export const askGraphDatabaseInternalFieldNames = createActionRequester<GraphDatabaseInternalFieldNames>()({
  actionType: GraphDatabaseActionType.InternalFieldNames,
});
