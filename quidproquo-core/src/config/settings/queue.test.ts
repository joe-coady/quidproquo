import { describe, expect, it } from 'vitest';

import { QPQCoreConfigSettingType } from '../QPQConfig';
import { defineQueue } from './queue';

describe('defineQueue', () => {
  const processors = { 'Demo/Job': '/entry/queue::onJob' as const };

  it('builds a Queue setting with the given name, processors and defaults', () => {
    expect(defineQueue('Jobs', processors)).toEqual({
      configSettingType: QPQCoreConfigSettingType.queue,
      uniqueKey: 'Jobs',
      name: 'Jobs',
      batchSize: 0,
      batchWindowInSeconds: 5,
      concurrency: 1,
      maxTries: 1,
      ttRetryInSeconds: 15 * 60,
      hasDeadLetterQueue: true,
      qpqQueueProcessors: processors,
      eventBusSubscriptions: [],
      maxConcurrentExecutions: undefined,
      isFifo: false,
    });
  });

  it('caps ttRetryInSeconds at 15 minutes', () => {
    expect(defineQueue('Jobs', processors, { ttRetryInSeconds: 99999 }).ttRetryInSeconds).toBe(15 * 60);
  });

  it('applies supplied batching options', () => {
    const setting = defineQueue('Jobs', processors, { batchSize: 10, concurrency: 4, eventBusSubscriptions: ['bus'] });

    expect(setting.batchSize).toBe(10);
    expect(setting.concurrency).toBe(4);
    expect(setting.eventBusSubscriptions).toEqual(['bus']);
  });

  it('applies isFifo when supplied', () => {
    expect(defineQueue('Jobs', processors, { isFifo: true }).isFifo).toBe(true);
  });
});
