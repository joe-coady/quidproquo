import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  askKeyValueStoreGet,
  createImplementationRuntime,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { createActor, createMachine } from 'xstate';

import { StateMachineActionType, StateMachineGetStateActionProcessor } from '../actions';
import { getStateMachineByName } from '../config';

const getProcessStateMachineGetState = (qpqConfig: QPQConfig): StateMachineGetStateActionProcessor => {
  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const smConfig = getStateMachineByName(qpqConfig, payload.stateMachineName);
    if (!smConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `State machine not found: ${payload.stateMachineName}`);
    }

    const resolveStory = createImplementationRuntime(
      qpqConfig,
      ['StateMachine GetState'],
      () => new Date().toISOString(),
      () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      session,
      actionProcessors,
      logger,
      dynamicModuleLoader,
      streamRegistry,
    );

    // Load entity from KVS
    const getResult = await resolveStory(
      function* () { return yield* askKeyValueStoreGet<Record<string, any>>(smConfig.keyValueStoreName, payload.id); },
      [],
    );
    if (getResult.error) {
      return actionResultError(getResult.error.errorType, getResult.error.errorText);
    }

    const entity = getResult.result;
    if (!entity) {
      return actionResultError(ErrorTypeEnum.NotFound, `Entity not found: ${payload.id}`);
    }

    const persistedSnapshot = entity[smConfig.stateField];
    if (!persistedSnapshot) {
      return actionResultError(ErrorTypeEnum.NotFound, `No state machine state found on entity: ${payload.id}`);
    }

    // XState: rehydrate to read current state
    const machine = createMachine(smConfig.config as any);
    const actor = createActor(machine, { snapshot: persistedSnapshot });
    actor.start();

    const snapshot = actor.getSnapshot();
    actor.stop();

    return actionResult({
      value: typeof snapshot.value === 'string' ? snapshot.value : JSON.stringify(snapshot.value),
      done: snapshot.status === 'done',
    });
  };
};

export const getStateMachineGetStateActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [StateMachineActionType.GetState]: getProcessStateMachineGetState(qpqConfig),
});
