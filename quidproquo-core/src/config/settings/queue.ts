import { QpqFunctionRuntime } from '../../types';
import { QPQConfigSetting, QPQCoreConfigSettingType, QPQConfigAdvancedSettings } from '../QPQConfig';

export interface QpqQueueProcessors {
  [type: string]: QpqFunctionRuntime;
}

export interface QPQConfigAdvancedQueueSettings extends QPQConfigAdvancedSettings {
  batchSize?: number;
  batchWindowInSeconds?: number;
  concurrency?: number;
  maxTries?: number;
  ttRetryInSeconds?: number;
  hasDeadLetterQueue?: boolean;
  eventBusSubscriptions?: string[];
  maxConcurrentExecutions?: number;
}

export interface QueueQPQConfigSetting extends QPQConfigSetting {
  name: string;

  batchSize: number;
  batchWindowInSeconds: number;

  concurrency: number;

  maxTries: number;
  ttRetryInSeconds: number;

  hasDeadLetterQueue: boolean;
  qpqQueueProcessors: QpqQueueProcessors;

  eventBusSubscriptions: string[];

  maxConcurrentExecutions?: number;
}

export const defineQueue = (name: string, processors: QpqQueueProcessors, options?: QPQConfigAdvancedQueueSettings): QueueQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.queue,
  uniqueKey: name,

  name,

  batchSize: options?.batchSize || 0,
  batchWindowInSeconds: options?.batchWindowInSeconds || 5,

  concurrency: options?.concurrency || 1,

  maxTries: options?.maxTries || 1,
  ttRetryInSeconds: Math.min(options?.ttRetryInSeconds || 15 * 60, 15 * 60),

  hasDeadLetterQueue: options?.hasDeadLetterQueue || true,

  qpqQueueProcessors: processors,

  eventBusSubscriptions: options?.eventBusSubscriptions || [],

  maxConcurrentExecutions: options?.maxConcurrentExecutions,
});
