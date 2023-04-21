import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

export interface QpqSourceEntry {
  src: string;
  runtime: string;
}

export interface QpqQueueProcessors {
  [type: string]: QpqSourceEntry;
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

  buildPath: string;

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

export const defineQueue = (
  name: string,
  buildPath: string,
  processors: QpqQueueProcessors,
  options?: QPQConfigAdvancedQueueSettings,
): QueueQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.queue,
  uniqueKey: name,

  name,
  buildPath,

  batchSize: options?.batchSize || 1,
  batchWindowInSeconds: options?.batchWindowInSeconds || 5,

  concurrency: options?.concurrency || 1,

  maxTries: options?.maxTries || 1,
  ttRetryInSeconds: Math.min(options?.ttRetryInSeconds || 300, 30),

  hasDeadLetterQueue: options?.hasDeadLetterQueue || true,

  qpqQueueProcessors: processors,

  eventBusSubscriptions: options?.eventBusSubscriptions || [],

  maxConcurrentExecutions: options?.maxConcurrentExecutions,
});
