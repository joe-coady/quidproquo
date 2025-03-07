import { actionResultError } from '../logic/actionLogic';
import { DynamicModuleLoader, QpqLogger, StorySession } from '../types';
import { Action, ActionProcessorList, ActionProcessorResult } from '../types/Action';
import { ErrorTypeEnum } from '../types/ErrorTypeEnum';

export async function processAction(
  action: Action<any>,
  actionProcessors: ActionProcessorList,
  session: StorySession,
  logger: QpqLogger,
  updateSession: (session: Partial<StorySession>) => void,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorResult<any>> {
  try {
    const processor = actionProcessors?.[action?.type];
    if (!processor) {
      throw new Error(`Unable to process action: ${action?.type} from [${Object.keys(actionProcessors).join(', ')}]`);
    }
    return await processor(action.payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader);
  } catch (e: unknown) {
    if (e instanceof Error) {
      const errorName = (e as any).name;
      const errorText = errorName ? `[${errorName}] - ${e.message}` : e.message;
      return actionResultError(ErrorTypeEnum.GenericError, errorText, e.stack);
    }
    return actionResultError(ErrorTypeEnum.GenericError, `An unknown error occurred in [${action?.type}]`);
  }
}
