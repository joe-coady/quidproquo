import { actionResult, createActionProcessor, ProcessorFor, QPQConfig } from 'quidproquo-core';
import { askDnsList, DnsActionType, qpqWebServerUtils } from 'quidproquo-webserver';

const getProcessDnsList = (qpqConfig: QPQConfig): ProcessorFor<typeof askDnsList> => {
  return async () => {
    const dnsList = qpqWebServerUtils.getDnsConfigs(qpqConfig).map((dc) => dc.dnsBase);

    return actionResult(dnsList);
  };
};

export const getDnsListActionProcessor = createActionProcessor(askDnsList, getProcessDnsList);
