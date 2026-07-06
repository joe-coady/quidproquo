import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { MetricActionType } from './MetricActionType';
import { MetricUnit } from './MetricUnit';

// Payload
export interface MetricPutActionPayload {
  metricName: string;
  value: number;
  unit?: MetricUnit;

  /**
   * Extra metric dimensions on top of the standard service/environment ones. Each unique
   * dimension combination is its own metric (and its own cost) - keep these
   * low-cardinality: never per-user or per-request identifiers.
   */
  dimensions?: Record<string, string>;
}

// Action
export interface MetricPutAction extends Action<MetricPutActionPayload> {
  type: MetricActionType.Put;
  payload: MetricPutActionPayload;
}

// Functions
export type MetricPutActionProcessor = ActionProcessor<MetricPutAction, void>;
export type MetricPutActionRequester = ActionRequester<MetricPutAction, void>;
