import { actionResultError } from '../logic/actionLogic';
import { DynamicModuleLoader, QpqLogger, StorySession, StreamRegistry } from '../types';
import { Action, ActionProcessorList, ActionProcessorResult } from '../types/Action';
import { ErrorTypeEnum } from '../types/ErrorTypeEnum';

export async function processAction(
  action: Action<any>,
  actionProcessors: ActionProcessorList,
  session: StorySession,
  logger: QpqLogger,
  updateSession: (session: Partial<StorySession>) => void,
  dynamicModuleLoader: DynamicModuleLoader,
  streamRegistry: StreamRegistry,
): Promise<ActionProcessorResult<any>> {
  try {
    const processor = actionProcessors?.[action?.type];
    if (!processor) {
      throw new Error(`Unable to process action: ${action?.type} from [${Object.keys(actionProcessors).join(', ')}]`);
    }

    // Merge any context carried on the action into the session
    // This allows context providers to propagate values to sub-runtimes
    // TODO: We need todo the same thing with auth, currently we mutate the runtime when set new auth.
    const effectiveSession = { ...session, context: { ...session.context, ...action.context } };

    return await processor(action.payload, effectiveSession, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry);
  } catch (e: unknown) {
    if (e instanceof Error) {
      const errorName = (e as any).name;
      const errorText = errorName ? `[${errorName}] - ${e.message}` : e.message;
      return actionResultError(ErrorTypeEnum.GenericError, errorText, e.stack);
    }
    return actionResultError(ErrorTypeEnum.GenericError, `An unknown error occurred in [${action?.type}]`);
  }
}
