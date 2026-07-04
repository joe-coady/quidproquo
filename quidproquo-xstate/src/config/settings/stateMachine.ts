import { CrossModuleOwner, defineKeyValueStore, QPQConfigAdvancedSettings, QPQConfigSetting, QpqFunctionRuntime } from 'quidproquo-core';

import { EventObject, MachineConfig, MachineContext } from 'xstate';

import { QPQXStateConfigSettingType } from '../QPQConfig';

export interface StateMachineRuntimeMap {
  [name: string]: QpqFunctionRuntime;
}

export interface QPQConfigAdvancedStateMachineSettings extends QPQConfigAdvancedSettings {
  config: MachineConfig<MachineContext, EventObject>;
  actions?: StateMachineRuntimeMap;
  guards?: StateMachineRuntimeMap;
  stateField?: string;
  owner?: CrossModuleOwner;
}

export interface StateMachineQPQConfigSetting extends QPQConfigSetting {
  stateMachineName: string;
  keyValueStoreName: string;
  config: MachineConfig<MachineContext, EventObject>;
  actions: StateMachineRuntimeMap;
  guards: StateMachineRuntimeMap;
  stateField: string;
}

export const getStateMachineStoreName = (stateMachineName: string): string => `qpq-sm-${stateMachineName}`;

export const defineStateMachine = (stateMachineName: string, options: QPQConfigAdvancedStateMachineSettings): QPQConfigSetting[] => {
  const keyValueStoreName = getStateMachineStoreName(stateMachineName);
  const stateMachineConfig: StateMachineQPQConfigSetting = {
    configSettingType: QPQXStateConfigSettingType.StateMachine,
    uniqueKey: stateMachineName,

    stateMachineName,
    keyValueStoreName,

    config: options.config,
    actions: options.actions ?? {},
    guards: options.guards ?? {},
    stateField: options.stateField ?? '__machineState',

    owner: options.owner,
  };

  return [defineKeyValueStore(keyValueStoreName, 'id'), stateMachineConfig];
};
