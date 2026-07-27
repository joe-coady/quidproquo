import { ActionProcessorList, ActionProcessorListResolver, actionResult, actionResultError, ErrorTypeEnum, QPQConfig } from 'quidproquo-core';

import { StateMachineActionType, StateMachineGetActionProcessor } from '../actions';
import { getStateMachineByName } from '../config';
import { StateMachineEntity } from '../models/StateMachineEntity';
import { createStateMachineStoryResolver } from './utils/createStateMachineStoryResolver';
import { loadStateMachineEntity } from './utils/loadStateMachineEntity';

const getProcessStateMachineGet = (qpqConfig: QPQConfig): StateMachineGetActionProcessor<StateMachineEntity> => {
  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const smConfig = getStateMachineByName(qpqConfig, payload.stateMachineName);
    if (!smConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `State machine not found: ${payload.stateMachineName}`);
    }

    const resolveStory = createStateMachineStoryResolver(
      'StateMachine Get',
      qpqConfig,
      session,
      actionProcessors,
      logger,
      dynamicModuleLoader,
      streamRegistry,
    );

    const entityResult = await loadStateMachineEntity(resolveStory, smConfig, payload.id);
    if (!entityResult.success) {
      return actionResultError(entityResult.error.errorType, entityResult.error.errorText);
    }

    return actionResult(entityResult.result);
  };
};

export const getStateMachineGetActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [StateMachineActionType.Get]: getProcessStateMachineGet(qpqConfig),
});
