import { Action, ActionProcessorList, ActionProcessorResult } from './types/Action';
import { ErrorTypeEnum } from './types/ErrorTypeEnum';
import { StoryResult, StorySession, QpqRuntimeType } from './types/StorySession';
import { SystemActionType } from './actions/system/SystemActionType';
import {
  resolveActionResult,
  resolveActionResultError,
  isErroredActionResult,
  actionResult,
  actionResultError,
} from './logic/actionLogic';

// Make this type safe omg.
async function processAction(
  action: Action<any>,
  actionProcessors: ActionProcessorList,
  session: any,
  logger: (res: StoryResult<any>) => Promise<void>,
) {
  // Special action ~ batch - needs access to the processAction / actionProcessor context
  if (action.type === SystemActionType.Batch) {
    const batchRes = await Promise.all(
      action.payload.actions.map((a: any) => {
        return a ? processAction(a, actionProcessors, session, logger) : null;
      }),
    );

    // If there was an error, throw that error back
    const erroredBatchItem = batchRes.find((br) => isErroredActionResult(br));
    if (erroredBatchItem) {
      const error = resolveActionResultError(erroredBatchItem);
      return actionResultError(ErrorTypeEnum.GenericError, error.errorText, error.errorStack);
    }

    // unwrap the values
    return actionResult(batchRes.map((br) => resolveActionResult(br)));
  }

  const processor = actionProcessors?.[action?.type];
  if (!processor) {
    throw new Error(
      `Unable to process action: ${action?.type} from ${Object.keys(actionProcessors).join(', ')}`,
    );
  }

  return await processor(action.payload, session, actionProcessors, logger);
}

export const createRuntime = (
  session: StorySession,
  actionProcessors: ActionProcessorList,
  getTimeNow: () => string,
  logger: (res: StoryResult<any>) => Promise<void>,
  newGuid: () => string,
  runtimeType: QpqRuntimeType,
  initialTags?: string[],
) => {
  async function resolveStory<TArgs extends Array<any>>(
    story: (...args: TArgs) => Generator<any, any, Action<any>>,
    args: TArgs,
  ): Promise<StoryResult<any>> {
    const reader = story(...args);

    let action = null;

    const response: StoryResult<any> = {
      input: args,
      session: { ...session },
      history: [],
      startedAt: getTimeNow(),

      tags: initialTags || [],

      correlation: newGuid(),
      fromCorrelation: session.correlation,
      runtimeType: runtimeType,
    };

    try {
      action = reader.next();

      while (!action.done) {
        const executionTime = getTimeNow();

        const actionResult: ActionProcessorResult<any> = await processAction(
          action.value,
          actionProcessors,
          session,
          logger,
        );

        const history = {
          act: action.value,
          res: actionResult,
          startedAt: executionTime,
          finishedAt: getTimeNow(),
        };

        console.log(
          `${action.value.type}: took ${
            new Date(history.finishedAt).getTime() - new Date(history.startedAt).getTime()
          }ms`,
        );

        response.history.push(history);

        if (isErroredActionResult(actionResult)) {
          console.log('Caught Error: ', JSON.stringify(resolveActionResultError(actionResult)));
          return {
            ...response,
            finishedAt: getTimeNow(),
            error: resolveActionResultError(actionResult),
          };
        }

        // TODO: Catch errors here ~ business logic
        action = reader.next(resolveActionResult(actionResult));
      }
    } catch (err) {
      // Dev Only ~ Todo
      if (err instanceof Error) {
        console.log(
          `Uncaught Error: [${JSON.stringify(action?.value?.type)}] ${err.message.toString()}`,
        );
        return {
          ...response,
          finishedAt: getTimeNow(),
          error: {
            errorText: err.message.toString(),
            errorType: ErrorTypeEnum.GenericError, // resolve error type from err type?
          },
        };
      }

      // Prod
      return {
        ...response,
        finishedAt: getTimeNow(),
        error: {
          errorText: 'Unknown error has occurred!',
          errorType: ErrorTypeEnum.GenericError,
        },
      };
    }

    const storyResult = {
      ...response,
      finishedAt: getTimeNow(),
      result: action.value,
    };

    console.log(
      `story took took ${
        new Date(storyResult.finishedAt).getTime() - new Date(storyResult.startedAt).getTime()
      }ms`,
    );

    return storyResult;
  }

  async function resolveStoryWithLogs<TArgs extends Array<any>>(
    story: (...args: TArgs) => Generator<any, any, Action<any>>,
    args: TArgs,
  ): Promise<StoryResult<any>> {
    const storyResult = await resolveStory(story, args);

    await logger(storyResult);

    return storyResult;
  }

  return resolveStoryWithLogs;
};
