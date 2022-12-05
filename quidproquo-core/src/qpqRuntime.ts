import { Action, ActionProcessor, ActionProcessorResult } from './types/Action';
import { ErrorTypeEnum } from './types/ErrorTypeEnum';
import { StoryResult, StorySession, ActionHistory } from './types/StorySession';
import { SystemActionType } from './actions/system/SystemActionType';
import {
  resolveActionResult,
  resolveActionResultError,
  isErroredActionResult,
} from './logic/actionLogic';

async function processAction(action: Action<any>, actionProcessors: any, session: any) {
  // Special action ~ batch - needs access to the processAction / actionProcessor context
  if (action.type === SystemActionType.Batch) {
    return await Promise.all(
      action.payload.actions.map((a: any) => {
        return a ? processAction(a, actionProcessors, session) : null;
      }),
    );
  }

  const processor = actionProcessors?.[action?.type];
  if (!processor) {
    return;
  }

  return await processor(action.payload, session);
}

export const createRuntime = (
  session: StorySession,
  actionProcessors: { [key: string]: ActionProcessor<any> },
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
        console.log(action.value);
        const actionResult: ActionProcessorResult<any> = await processAction(
          action.value,
          actionProcessors,
          session,
        );

        console.log(actionResult);

        response.history.push({
          act: action.value,
          res: actionResult,
          startedAt: executionTime,
          finishedAt: getTimeNow(),
        });

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

    return storyResult;
  }

  return resolveStory;
};
