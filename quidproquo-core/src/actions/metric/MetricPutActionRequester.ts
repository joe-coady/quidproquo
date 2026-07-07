import { MetricActionType } from './MetricActionType';
import { MetricPutActionRequester } from './MetricPutActionTypes';
import { MetricUnit } from './MetricUnit';

export interface AskMetricPutOptions {
  unit?: MetricUnit;
  dimensions?: Record<string, string>;
}

export function* askMetricPut(metricName: string, value: number = 1, options?: AskMetricPutOptions): MetricPutActionRequester {
  return yield {
    type: MetricActionType.Put,
    payload: {
      metricName,
      value,
      unit: options?.unit,
      dimensions: options?.dimensions,
    },
  };
}
