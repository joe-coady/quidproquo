import {
  ActionProcessorList,
  ActionProcessorListResolver,
  EitherActionResult,
  QPQConfig,
  SystemActionType,
  SystemBatchActionProcessor,
  actionResult,
  actionResultError,
  isErroredActionResult,
  processAction,
  resolveActionResult,
  resolveActionResultError,
} from 'quidproquo-core';

const getProcessSystemBatch = (qpqConfig: QPQConfig): SystemBatchActionProcessor<any[]> => {
  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader) => {
    // console.log('~~~~~~~~~~~ RUNNING BATCH ~~~~~~~~~: ', payload);

    const batchRes = await Promise.all(
      payload.actions.map((a: any) => processAction(a, actionProcessors, session, logger, updateSession, dynamicModuleLoader)),
    );

    // console.log('~~~~~~~~~~~ RESULT BATCH ~~~~~~~~~: ', batchRes);

    // If there was an error, that does not want to be returned, throw that error back
    const erroredBatchItem = batchRes.find((br, i) => isErroredActionResult(br) && !payload.actions[i].returnErrors);
    if (erroredBatchItem) {
      const error = resolveActionResultError(erroredBatchItem);
      return actionResultError(error.errorType, error.errorText, error.errorStack);
    }

    // unwrap the values
    return actionResult(
      batchRes.map((br, i) => {
        // If we want to return errors, return the either result.
        if (payload.actions[i].returnErrors) {
          const isSuccess = !isErroredActionResult(br);
          const result: EitherActionResult<any> = isSuccess
            ? {
                success: true,
                result: resolveActionResult(br),
              }
            : {
                success: false,
                error: resolveActionResultError(br),
              };

          return result;
        }

        // return the resolved result
        return resolveActionResult(br);
      }),
    );
  };
};

export const getSystemBatchActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [SystemActionType.Batch]: getProcessSystemBatch(qpqConfig),
});
