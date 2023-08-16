import { Action, ActionProcessorList, ActionProcessorResult, ActionRequester, EitherActionResult } from './types/Action';
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
import { QPQConfig } from './config';

import { getApplicationModuleName } from './qpqCoreUtils';

// Make this type safe omg.
async function processAction(
  action: Action<any>,
  actionProcessors: ActionProcessorList,
  session: StorySession,
  logger: (res: StoryResult<any>) => Promise<void>,
) {
  try {
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
  } catch (e: unknown) {
    if (e instanceof Error) {
      return actionResultError(ErrorTypeEnum.GenericError, e.message, e.stack);
    }
    return actionResultError(ErrorTypeEnum.GenericError, `An unknown error occurred in [${action?.type}]`);
  }
}

export const createRuntime = (
  qpqConfig: QPQConfig,
  callerSession: StorySession,
  actionProcessors: ActionProcessorList,
  getTimeNow: () => string,
  logger: (res: StoryResult<any>) => Promise<void>,
  runtimeCorrelation: string,
  runtimeType: QpqRuntimeType,
  initialTags?: string[],
) => {
  async function resolveStory<TArgs extends Array<any>>(
    story: (...args: TArgs) => ActionRequester<Action<any>, any, any>,
    args: TArgs,
  ): Promise<StoryResult<any>> {
    const reader = story(...args);

    let storyProgress = null;

    const storySession: StorySession = {
      correlation: runtimeCorrelation,
      depth: callerSession.depth + 1,
      accessToken: callerSession.accessToken,
    };

    const response: StoryResult<any> = {
      input: args,
      session: storySession,

      history: [],
      startedAt: getTimeNow(),

      tags: initialTags || [],
      moduleName: getApplicationModuleName(qpqConfig),

      correlation: storySession.correlation!,
      fromCorrelation: callerSession.correlation,
      runtimeType: runtimeType,
    };

    // Exit if the depth has exceeded the limit (of 100)
    if (storySession.depth > 100) {
      return {
        ...response,
        finishedAt: getTimeNow(),
        error: {
          errorText: `Story depth exceeded [${storySession.depth}]!`,
          errorType: ErrorTypeEnum.GenericError,
        },
      }
    }

    try {
      storyProgress = reader.next();

      while (!storyProgress.done) {
        const action: Action<any> = storyProgress.value;
        const executionTime = getTimeNow();

        const actionResult: ActionProcessorResult<any> = await processAction(
          action,
          actionProcessors,
          storySession,
          logger,
        );

        const history = {
          act: action,
          res: actionResult,
          startedAt: executionTime,
          finishedAt: getTimeNow(),
        };

        console.log(
          `${action.type}: took ${
            new Date(history.finishedAt).getTime() - new Date(history.startedAt).getTime()
          }ms`,
        );

        response.history.push(history);

        if (isErroredActionResult(actionResult) && !action.returnErrors) {
          console.log('Caught Error: ', JSON.stringify(resolveActionResultError(actionResult)));
          return {
            ...response,
            finishedAt: getTimeNow(),
            error: resolveActionResultError(actionResult),
          };
        }

        // TODO: Catch errors here ~ business logic
        if (action.returnErrors) {
          const isSuccess = !isErroredActionResult(actionResult);
          const result: EitherActionResult<any> = isSuccess
            ? {
                success: true,
                result: resolveActionResult(actionResult),
              }
            : {
                success: false,
                error: resolveActionResultError(actionResult),
              };
          
          storyProgress = reader.next(result);
        } else {
          storyProgress = reader.next(resolveActionResult(actionResult));
        }
      }
    } catch (err) {
      // Dev Only ~ Todo
      if (err instanceof Error) {
        console.log(
          `Uncaught Error: [${JSON.stringify(storyProgress?.value?.type)}] ${err.message.toString()}`,
        );
        return {
          ...response,
          finishedAt: getTimeNow(),
          error: {
            errorText: err.message.toString(),
            errorType: ErrorTypeEnum.GenericError, // resolve error type from err type?
            errorStack: storyProgress?.value?.type,
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
          errorStack: storyProgress?.value?.type,
        },
      };
    }

    const storyResult = {
      ...response,
      finishedAt: getTimeNow(),
      result: storyProgress.value,
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
