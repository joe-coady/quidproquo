import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { WindowActionType, WindowGetLocationActionProcessor } from 'quidproquo-web';

const getProcessWindowGetLocation = (qpqConfig: QPQConfig): WindowGetLocationActionProcessor => {
  return async () => {
    const { href, origin, protocol, host, hostname, port, pathname, search, hash } = window.location;

    // Return a plain serializable copy, never the live Location object.
    return actionResult({ href, origin, protocol, host, hostname, port, pathname, search, hash });
  };
};

export const getWindowGetLocationActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [WindowActionType.GetLocation]: getProcessWindowGetLocation(qpqConfig),
});
