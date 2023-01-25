import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export enum ScheduleTypeEnum {
  Recurring = 'Recurring',
}

export interface ScheduleQPQConfigSetting extends QPQConfigSetting {
  scheduleType: ScheduleTypeEnum;
  src: string;
  runtime: string;
  cronExpression: string;
}

export const defineRecurringSchedule = (
  cronExpression: string,
  src: string,
  runtime: string,
): ScheduleQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.schedule,
  uniqueKey: runtime,

  scheduleType: ScheduleTypeEnum.Recurring,

  src,
  runtime,

  cronExpression,
});
