import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  MetricActionType,
  MetricPutActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

// Dev-visible stand-in for the AWS EMF processor - keeps stories portable across runtimes
const getProcessMetricPut = (qpqConfig: QPQConfig): MetricPutActionProcessor => {
  return async ({ metricName, value, unit }) => {
    console.log(`metric: ${metricName}=${value}${unit ? ` ${unit}` : ''}`);

    return actionResult(void 0);
  };
};

export const getMetricPutActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [MetricActionType.Put]: getProcessMetricPut(qpqConfig),
});
