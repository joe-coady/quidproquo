import { QpqFunctionRuntime } from '../../types';
import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface ActionProcessorsQPQConfigSetting extends QPQConfigSetting {
  runtime: QpqFunctionRuntime;
}

export const defineActionProcessors = (getActionProcessors: QpqFunctionRuntime): ActionProcessorsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.actionProcessors,
  uniqueKey: getActionProcessors,

  runtime: getActionProcessors,
});
