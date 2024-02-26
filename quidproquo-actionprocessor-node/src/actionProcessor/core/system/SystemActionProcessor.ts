import {
  ErrorTypeEnum,
  SystemActionType,
  SystemBatchActionProcessor,
  actionResult,
  actionResultError,
  isErroredActionResult,
  processAction,
  resolveActionResult,
  resolveActionResultError,
} from 'quidproquo-core';

const processBatch: SystemBatchActionProcessor<any[]> = async (
  { actions },
  session,
  actionProcessors,
  logger,
  updateSession,
) => {
  const batchRes = await Promise.all(
    actions.map((a: any) => processAction(a, actionProcessors, session, logger, updateSession)),
  );

  // If there was an error, throw that error back
  const erroredBatchItem = batchRes.find((br) => isErroredActionResult(br));
  if (erroredBatchItem) {
    const error = resolveActionResultError(erroredBatchItem);
    return actionResultError(ErrorTypeEnum.GenericError, error.errorText, error.errorStack);
  }

  // unwrap the values
  return actionResult(batchRes.map((br) => resolveActionResult(br)));
};

export default {
  [SystemActionType.Batch]: processBatch,
};
