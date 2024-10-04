import {
  QPQConfig,
  GraphDatabaseActionType,
  ActionProcessorListResolver,
  ActionProcessorList,
  GraphDatabaseInternalFieldNamesActionProcessor,
  actionResult,
} from 'quidproquo-core';

const getProcessInternalFieldNames = (qpqConfig: QPQConfig): GraphDatabaseInternalFieldNamesActionProcessor => {
  return async () => {
    return actionResult({
      internalEndNode: '`~end`',
      internalId: '`~id`',
      internalLabel: '`~label`',
      internalStartNode: '`~start`',
      internalType: '`~type`',
    });
  };
};

export const getGraphDatabaseInternalFieldNamesActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [GraphDatabaseActionType.InternalFieldNames]: getProcessInternalFieldNames(qpqConfig),
});
