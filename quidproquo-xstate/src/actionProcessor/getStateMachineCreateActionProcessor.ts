import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  askKeyValueStoreUpsert,
  createImplementationRuntime,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { createActor, createMachine } from 'xstate';

import { StateMachineActionType, StateMachineCreateActionProcessor } from '../actions';
import { getStateMachineByName } from '../config';

const getProcessStateMachineCreate = (qpqConfig: QPQConfig): StateMachineCreateActionProcessor<any> => {
  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const smConfig = getStateMachineByName(qpqConfig, payload.stateMachineName);
    if (!smConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `State machine not found: ${payload.stateMachineName}`);
    }

    const resolveStory = createImplementationRuntime(
      qpqConfig,
      ['StateMachine Create'],
      () => new Date().toISOString(),
      () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      session,
      actionProcessors,
      logger,
      dynamicModuleLoader,
      streamRegistry,
    );

    // XState: determine initial state and which entry actions fire
    const firedActions: string[] = [];
    const actionImpls: Record<string, () => void> = {};
    for (const actionName of Object.keys(smConfig.actions)) {
      actionImpls[actionName] = () => {
        firedActions.push(actionName);
      };
    }

    const machine = createMachine(smConfig.config as any, {
      actions: actionImpls,
    });

    const actor = createActor(machine);
    actor.start();
    const initialSnapshot = actor.getPersistedSnapshot();
    actor.stop();

    // Build entity with id and machine state
    const entity: Record<string, any> = { ...payload.item, id: payload.id };
    entity[smConfig.stateField] = initialSnapshot;

    // Persist to KVS
    const upsertResult = await resolveStory(
      function* () { yield* askKeyValueStoreUpsert(smConfig.keyValueStoreName, entity); },
      [],
    );
    if (upsertResult.error) {
      return actionResultError(upsertResult.error.errorType, upsertResult.error.errorText);
    }

    // Execute side-effect stories for any initial entry actions
    for (const actionName of firedActions) {
      const runtime = smConfig.actions[actionName];
      if (runtime) {
        const storyModule = await dynamicModuleLoader(runtime);
        const storyResult = await resolveStory(storyModule, [entity]);
        if (storyResult.error) {
          return actionResultError(storyResult.error.errorType, storyResult.error.errorText);
        }
      }
    }

    return actionResult(entity);
  };
};

export const getStateMachineCreateActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [StateMachineActionType.Create]: getProcessStateMachineCreate(qpqConfig),
});
