import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { DnsActionType, DnsListActionProcessor, qpqWebServerUtils } from 'quidproquo-webserver';

const getProcessDnsList = (qpqConfig: QPQConfig): DnsListActionProcessor => {
  return async () => {
    const dnsList = qpqWebServerUtils.getDnsConfigs(qpqConfig).map((dc) => dc.dnsBase);

    return actionResult(dnsList);
  };
};

export const getDnsListActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [DnsActionType.List]: getProcessDnsList(qpqConfig),
});
