import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { StateMachineQPQConfigSetting } from './settings/stateMachine';
import { QPQXStateConfigSettingType } from './QPQConfig';

export const getAllStateMachines = (qpqConfig: QPQConfig): StateMachineQPQConfigSetting[] => {
  return qpqCoreUtils.getConfigSettings<StateMachineQPQConfigSetting>(qpqConfig, QPQXStateConfigSettingType.StateMachine);
};

export const getStateMachineByName = (qpqConfig: QPQConfig, stateMachineName: string): StateMachineQPQConfigSetting | undefined => {
  return getAllStateMachines(qpqConfig).find((sm) => sm.stateMachineName === stateMachineName);
};
