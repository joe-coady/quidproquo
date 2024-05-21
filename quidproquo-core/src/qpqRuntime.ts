import { Action, ActionProcessorList, ActionProcessorResult, ActionRequester, EitherActionResult } from './types/Action';
import { ErrorTypeEnum } from './types/ErrorTypeEnum';
import { StoryResult, StorySession, QpqRuntimeType, StorySessionUpdater, qpqConsoleLog } from './types/StorySession';

import { resolveActionResult, resolveActionResultError, isErroredActionResult, actionResultError } from './logic/actionLogic';
import { QPQConfig } from './config';
import { QpqLogger } from './types';

import { getApplicationModuleName } from './qpqCoreUtils';

// Make this type safe omg.
export async function processAction(
  action: Action<any>,
  actionProcessors: ActionProcessorList,
  session: StorySession,
  logger: QpqLogger,
  updateSession: StorySessionUpdater,
) {
  try {
    const processor = actionProcessors?.[action?.type];
    if (!processor) {
      throw new Error(`Unable to process action: ${action?.type} from ${Object.keys(actionProcessors).join(', ')}`);
    }

    return await processor(action.payload, session, actionProcessors, logger, updateSession);
  } catch (e: unknown) {
    if (e instanceof Error) {
      const errorName = (e as any).name;
      const errorText = errorName ? `[${errorName}] - ${e.message}` : e.message;

      return actionResultError(ErrorTypeEnum.GenericError, errorText, e.stack);
    }
    return actionResultError(ErrorTypeEnum.GenericError, `An unknown error occurred in [${action?.type}]`);
  }
}

export const createRuntime = (
  qpqConfig: QPQConfig,
  callerSession: StorySession,
  actionProcessors: ActionProcessorList,
  getTimeNow: () => string,
  logger: QpqLogger,
  runtimeCorrelation: string,
  runtimeType: QpqRuntimeType,
  initialTags?: string[],
) => {
  async function resolveStory<TArgs extends Array<any>>(
    story: (...args: TArgs) => ActionRequester<Action<any>, any, any>,
    args: TArgs,
  ): Promise<StoryResult<any>> {
    const reader = story(...args);

    let storyProgress: IteratorResult<Action<any>, any> | null = null;

    let storySession: StorySession = {
      correlation: runtimeCorrelation,
      depth: callerSession.depth + 1,
      accessToken: callerSession.accessToken,
      context: callerSession.context,
    };

    const updateSession: StorySessionUpdater = (newSession: Partial<StorySession>): void => {
      storySession = {
        ...storySession,
        ...newSession,
      };
    };

    const response: StoryResult<any> = {
      input: args,
      session: { ...storySession },

      history: [],

      startedAt: getTimeNow(),
      finishedAt: getTimeNow(),

      tags: initialTags || [],
      moduleName: getApplicationModuleName(qpqConfig),

      correlation: storySession.correlation!,
      fromCorrelation: callerSession.correlation,
      runtimeType: runtimeType,

      logs: [],
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
      };
    }

    try {
      storyProgress = reader.next();

      while (!storyProgress.done) {
        const action: Action<any> = storyProgress.value;
        const executionTime = getTimeNow();

        const actionResult: ActionProcessorResult<any> = await processAction(action, actionProcessors, storySession, logger, updateSession);

        const history = {
          act: action,
          res: actionResult,
          startedAt: executionTime,
          finishedAt: getTimeNow(),
        };

        console.log(`${action.type}: took ${new Date(history.finishedAt).getTime() - new Date(history.startedAt).getTime()}ms`);

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
        console.log(`Uncaught Error: [${JSON.stringify(storyProgress?.value?.type)}] ${err.message.toString()}`);
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

    console.log(`story took took ${new Date(storyResult.finishedAt).getTime() - new Date(storyResult.startedAt).getTime()}ms`);

    return storyResult;
  }

  async function resolveStoryWithLogs<TArgs extends Array<any>>(
    story: (...args: TArgs) => Generator<any, any, Action<any>>,
    args: TArgs,
  ): Promise<StoryResult<any>> {
    const logs: any[] = [];
    const oldConsoleLog = console.log;

    try {
      // TODO: This would need to change once we move to web
      // we can't just override console.log like this when running concurrently
      console.log = (...args: any[]) => {
        const logLog: qpqConsoleLog = {
          t: getTimeNow(),
          a: args,
        };

        logs.push(logLog);

        return oldConsoleLog(...args);
      };

      const storyResult = await resolveStory(story, args);

      storyResult.logs = logs;

      await logger.log(storyResult);

      return storyResult;
    } finally {
      console.log = oldConsoleLog;
    }
  }

  return resolveStoryWithLogs;
};
