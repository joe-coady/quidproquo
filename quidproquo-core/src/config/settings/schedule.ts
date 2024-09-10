import { getStoryNameFromQpqFunctionRuntime } from '../../qpqCoreUtils';
import { QpqFunctionRuntime } from '../../types';
import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export enum ScheduleTypeEnum {
  Recurring = 'Recurring',
}

export interface ScheduleQPQConfigSetting extends QPQConfigSetting {
  scheduleType: ScheduleTypeEnum;

  runtime: QpqFunctionRuntime;
  cronExpression: string;
  buildPath: string;
}

export const defineRecurringSchedule = (cronExpression: string, runtime: QpqFunctionRuntime, buildPath: string): ScheduleQPQConfigSetting => {
  const uniqueKey = getStoryNameFromQpqFunctionRuntime(runtime);

  return {
    configSettingType: QPQCoreConfigSettingType.schedule,
    uniqueKey: uniqueKey,

    scheduleType: ScheduleTypeEnum.Recurring,

    runtime,

    cronExpression,

    buildPath,
  };
};
