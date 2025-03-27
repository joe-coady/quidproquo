import { SystemActionType, SystemExecuteStoryActionPayload, SystemExecuteStoryActionProcessor } from '../actions';
import { QPQConfig } from '../config';
import { actionResult, actionResultError, isErroredActionResult, resolveActionResult, resolveActionResultError } from '../logic/actionLogic';
import { processAction } from '../runtime';
import { askRunParallel } from '../stories';
import {
  ActionProcessor,
  ActionProcessorList,
  ActionProcessorListResolver,
  AskResponse,
  AskResponseReturnType,
  DynamicModuleLoader,
  ErrorTypeEnum,
  QpqLogger,
  Story,
  StorySession,
  StorySessionUpdater,
} from '../types';

export const getDateNow = () => new Date().toISOString();

type QpqPromisifyRuntime = Parameters<ActionProcessor<any, any>>;

// Define the base type for getRun
export type QpqResolveAsPromise = <T extends AskResponse<any>>(storyRuntime: T) => Promise<AskResponseReturnType<T>>;

export function qpqPromisify<S extends Story<any, any>>(
  story: S,
  runtimeInfo: QpqPromisifyRuntime,
): (...params: Parameters<S>) => Promise<AskResponseReturnType<ReturnType<S>>> {
  return async (...params: Parameters<S>): Promise<AskResponseReturnType<ReturnType<S>>> => {
    try {
      const reader = story(...params);
      let storyProgress = reader.next();

      while (!storyProgress.done) {
        const action = storyProgress.value;

        const [payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader] = runtimeInfo;
        const actionResult = await processAction(action, actionProcessors, session, logger, updateSession, dynamicModuleLoader);

        const isSuccess = !isErroredActionResult(actionResult);

        if (action.returnErrors) {
          const result = isSuccess
            ? { success: true, result: resolveActionResult(actionResult) }
            : { success: false, error: resolveActionResultError(actionResult) };

          storyProgress = reader.next(result);
        } else {
          if (!isSuccess) {
            throw new Error(resolveActionResultError(actionResult).errorText);
          }

          const result = resolveActionResult(actionResult);
          storyProgress = reader.next(result);
        }
      }

      return storyProgress.value;
    } catch (error) {
      throw new Error(`Error in qpqPromisify: ${error}`);
    }
  };
}

export const getRun =
  (qpqPromisifyRuntime: QpqPromisifyRuntime): QpqResolveAsPromise =>
  async <T extends AskResponse<any>>(storyRuntime: T): Promise<AskResponseReturnType<T>> => {
    const runAny = qpqPromisify(askRunParallel, qpqPromisifyRuntime);
    const [result] = await runAny([storyRuntime]);
    return result;
  };

const getProcessExecuteStory = <T extends Array<any>, R>(qpqConfig: QPQConfig): SystemExecuteStoryActionProcessor<T, R> => {
  return async (
    payload: SystemExecuteStoryActionPayload<T>,
    session: StorySession,
    actionProcessors: ActionProcessorList,
    logger: QpqLogger,
    updateSession: StorySessionUpdater,
    dynamicModuleLoader: DynamicModuleLoader,
  ): Promise<any> => {
    let story = await dynamicModuleLoader(payload.runtime);
    if (!story) {
      return actionResultError(ErrorTypeEnum.NotFound, `Unable to dynamically load: [${payload.runtime}]`);
    }

    try {
      const qpqPromisifyRuntime: QpqPromisifyRuntime = [payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader];
      const result = await story(...payload.params, getRun(qpqPromisifyRuntime));

      return actionResult<R>(result);
    } catch (error) {
      return actionResultError(ErrorTypeEnum.GenericError, `${error}`);
    }
  };
};

export const getSystemExecuteStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [SystemActionType.ExecuteStory]: getProcessExecuteStory(qpqConfig),
});
