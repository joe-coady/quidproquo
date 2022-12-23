import { Action, ActionProcessorList, ActionProcessorResult } from './types/Action';
import { ErrorTypeEnum } from './types/ErrorTypeEnum';
import { StoryResult, StorySession, ActionHistory } from './types/StorySession';
import { SystemActionType } from './actions/system/SystemActionType';
import {
  resolveActionResult,
  resolveActionResultError,
  isErroredActionResult,
  actionResult,
} from './logic/actionLogic';

// Make this type safe omg.
async function processAction(
  action: Action<any>,
  actionProcessors: ActionProcessorList,
  session: any,
) {
  // Special action ~ batch - needs access to the processAction / actionProcessor context
  if (action.type === SystemActionType.Batch) {
    return actionResult(
      await Promise.all(
        action.payload.actions.map((a: any) => {
          return a ? processAction(a, actionProcessors, session) : null;
        }),
      ),
    );
  }

  const processor = actionProcessors?.[action?.type];
  if (!processor) {
    throw new Error(
      `Unable to process action: ${action?.type} from ${Object.keys(actionProcessors).join(', ')}`,
    );
  }

  return await processor(action.payload, session, actionProcessors);
}

export const createRuntime = (
  session: StorySession,
  actionProcessors: ActionProcessorList,
  getTimeNow: () => string,
  logger: (res: StoryResult<any>) => void,
  newGuid: () => string,
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

      fromCorrelation: session.correlation,
      correlation: newGuid(),
    };

    try {
      action = reader.next();

      while (!action.done) {
        const executionTime = getTimeNow();

        const actionResult: ActionProcessorResult<any> = await processAction(
          action.value,
          actionProcessors,
          session,
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
          return {
            ...response,
            finishedAt: getTimeNow(),
            error: resolveActionResultError(actionResult),
          };
        }

        action = reader.next(resolveActionResult(actionResult));
      }
    } catch (err) {
      // Dev Only ~ Todo
      if (err instanceof Error) {
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

    await logger(storyResult);

    console.log(
      `story took took ${
        new Date(storyResult.finishedAt).getTime() - new Date(storyResult.startedAt).getTime()
      }ms`,
    );

    return storyResult;
  }

  return resolveStory;
};
