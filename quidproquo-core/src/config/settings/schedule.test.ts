import { describe, expect, it } from 'vitest';

import { QPQCoreConfigSettingType } from '../QPQConfig';
import { defineRecurringSchedule, ScheduleTypeEnum } from './schedule';

describe('defineRecurringSchedule', () => {
  it('builds a recurring Schedule setting keyed by the runtime story name', () => {
    expect(defineRecurringSchedule('0 0 3 * * ? *', '/entry/cron::nightly')).toEqual({
      configSettingType: QPQCoreConfigSettingType.schedule,
      uniqueKey: 'nightly',
      scheduleType: ScheduleTypeEnum.Recurring,
      runtime: '/entry/cron::nightly',
      cronExpression: '0 0 3 * * ? *',
      metadata: {},
      owner: undefined,
    });
  });

  it('defaults metadata to an empty object', () => {
    expect(defineRecurringSchedule('* * * * ? *', '/entry/cron::tick').metadata).toEqual({});
  });

  it('passes supplied metadata through', () => {
    expect(defineRecurringSchedule('* * * * ? *', '/entry/cron::tick', { metadata: { team: 'ops' } }).metadata).toEqual({ team: 'ops' });
  });
});
