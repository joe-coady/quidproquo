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

export const defineRecurringSchedule = (cronExpression: string, runtime: QpqFunctionRuntime, buildPath: string): ScheduleQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.schedule,
  uniqueKey: runtime,

  scheduleType: ScheduleTypeEnum.Recurring,

  runtime,

  cronExpression,

  buildPath,
});
