import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  askKeyValueStoreGet,
  askKeyValueStoreUpsert,
  createImplementationRuntime,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { createActor, createMachine } from 'xstate';

import { StateMachineActionType, StateMachineSendEventActionProcessor } from '../actions';
import { getStateMachineByName } from '../config';

const getProcessStateMachineSendEvent = (qpqConfig: QPQConfig): StateMachineSendEventActionProcessor<any> => {
  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const smConfig = getStateMachineByName(qpqConfig, payload.stateMachineName);
    if (!smConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `State machine not found: ${payload.stateMachineName}`);
    }

    const resolveStory = createImplementationRuntime(
      qpqConfig,
      ['StateMachine SendEvent'],
      () => new Date().toISOString(),
      () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      session,
      actionProcessors,
      logger,
      dynamicModuleLoader,
      streamRegistry,
    );

    // Load entity from KVS
    let entity: Record<string, any> | undefined;
    const getResult = await resolveStory(function* () {
      return yield* askKeyValueStoreGet<Record<string, any>>(smConfig.keyValueStoreName, payload.id);
    }, []);
    if (getResult.error) {
      return actionResultError(getResult.error.errorType, getResult.error.errorText);
    }
    entity = getResult.result;

    if (!entity) {
      return actionResultError(ErrorTypeEnum.NotFound, `Entity not found: ${payload.id}`);
    }

    // Pre-evaluate guards via QPQ stories
    const guardResults: Record<string, boolean> = {};
    for (const [guardName, guardRuntime] of Object.entries(smConfig.guards)) {
      const guardModule = await dynamicModuleLoader(guardRuntime);
      const guardResult = await resolveStory(guardModule, [entity, payload.event]);
      if (guardResult.error) {
        return actionResultError(guardResult.error.errorType, guardResult.error.errorText);
      }
      guardResults[guardName] = guardResult.result;
    }

    const guardImpls: Record<string, () => boolean> = {};
    for (const [guardName, result] of Object.entries(guardResults)) {
      guardImpls[guardName] = () => result;
    }

    // Track which actions fire during the transition
    const firedActions: string[] = [];
    const actionImpls: Record<string, () => void> = {};
    for (const actionName of Object.keys(smConfig.actions)) {
      actionImpls[actionName] = () => {
        firedActions.push(actionName);
      };
    }

    // XState: build machine, rehydrate, send event
    const machine = createMachine(smConfig.config as any, {
      actions: actionImpls,
      guards: guardImpls,
    });

    const persistedSnapshot = entity[smConfig.stateField];
    const actor = createActor(machine, {
      snapshot: persistedSnapshot || undefined,
    });

    const previousState = actor.getSnapshot().value;

    actor.start();
    actor.send(payload.event);

    const newSnapshot = actor.getPersistedSnapshot();
    const currentState = actor.getSnapshot().value;
    const isDone = actor.getSnapshot().status === 'done';

    actor.stop();

    if (previousState === currentState && !isDone) {
      return actionResultError(
        ErrorTypeEnum.BadRequest,
        `Event '${payload.event.type}' is not valid for current state '${JSON.stringify(previousState)}'`,
      );
    }

    // Persist new snapshot
    entity[smConfig.stateField] = newSnapshot;
    const upsertResult = await resolveStory(function* () {
      yield* askKeyValueStoreUpsert(smConfig.keyValueStoreName, entity);
    }, []);
    if (upsertResult.error) {
      return actionResultError(upsertResult.error.errorType, upsertResult.error.errorText);
    }

    // Execute side-effect stories for fired actions
    for (const actionName of firedActions) {
      const runtime = smConfig.actions[actionName];
      if (runtime) {
        const storyModule = await dynamicModuleLoader(runtime);
        const storyResult = await resolveStory(storyModule, [entity, payload.event]);
        if (storyResult.error) {
          return actionResultError(storyResult.error.errorType, storyResult.error.errorText);
        }
      }
    }

    return actionResult(entity);
  };
};

export const getStateMachineSendEventActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [StateMachineActionType.SendEvent]: getProcessStateMachineSendEvent(qpqConfig),
});
