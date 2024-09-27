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

/**
 * Defines a recurring schedule using a cron expression.
 *
 * @param {string} cronExpression - The cron expression that specifies the schedule.
 *
 * **Cron Expression Format:**
 * ```
 * cron(minutes hours day-of-month month day-of-week year)
 * ```
 *
 * **Fields:**
 *
 * | Field           | Values                       | Wildcards         |
 * |-----------------|------------------------------|-------------------|
 * | **Minutes**     | `0-59`                       | `,` `-` `*` `/`   |
 * | **Hours**       | `0-23`                       | `,` `-` `*` `/`   |
 * | **Day-of-month**| `1-31`                       | `,` `-` `*` `?` `/` `L` `W` |
 * | **Month**       | `1-12` or `JAN-DEC`          | `,` `-` `*` `/`   |
 * | **Day-of-week** | `1-7` or `SUN-SAT`           | `,` `-` `*` `?` `L` `#` |
 * | **Year**        | `1970-2199`                  | `,` `-` `*` `/`   |
 *
 * **Wildcards:**
 *
 * - `,` (comma): Specifies additional values. Example: `JAN,FEB,MAR` in the Month field.
 * - `-` (dash): Specifies ranges. Example: `1-15` in the Day-of-month field includes days 1 through 15.
 * - `*` (asterisk): Includes all possible values. Example: `*` in the Hours field means every hour.
 *   - Note: You can't use `*` in both the Day-of-month and Day-of-week fields simultaneously. If you use `*` in one, use `?` in the other.
 * - `/` (slash): Specifies increments. Example: `0/10` in the Minutes field means every 10 minutes starting at minute 0.
 * - `?` (question mark): Specifies no specific value. Useful when you need to specify something in one of the two fields (Day-of-month or Day-of-week) but not the other.
 * - `L`: Specifies the last day of the month or week. Example: `L` in the Day-of-month field means the last day of the month.
 * - `W`: Specifies the nearest weekday. Example: `15W` in the Day-of-month field means the nearest weekday to the 15th of the month.
 * - `#`: Specifies the nth occurrence of a weekday in a month. Example: `3#2` in the Day-of-week field means the second Tuesday of the month (`3` represents Tuesday).
 *
 * **Examples:**
 *
 * - Every minute of every day:
 *   ```
 *   '* * * * ? *'
 *   ```
 * - Every 10 minutes:
 *   ```
 *   '0/10 * * * ? *'
 *   ```
 * - Every day at 3 AM Brisbane time:
 *   ```
 *   '0 0 3 * * ? *'
 *   ```
 * - Every Monday at 3 AM Brisbane time:
 *   ```
 *   '0 0 3 ? * 1 *'
 *   ```
 *
 * **Notes:**
 *
 * - The `?` wildcard is used when the specific value is not required in the Day-of-month or Day-of-week fields to avoid conflicts.
 *
 * @param {QpqFunctionRuntime} runtime - The runtime for the function to run.
 * @param {string} buildPath - The build path to the function's code.
 * @returns {ScheduleQPQConfigSetting} The configuration setting for the scheduled task.
 */
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
