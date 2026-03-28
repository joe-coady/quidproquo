import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  getProcessCustomImplementation,
  QPQConfig,
} from 'quidproquo-core';

import { RouteAuthValidationActionType, RouteAuthValidationDecodeActionProcessor } from '../../actions/routeAuthValidation';
import { askRouteAuthValidationDecodeDefault } from '../../stories/askRouteAuthValidationDecodeDefault';
import { generateUUID } from '../../utils/uuidUtils';

const getProcessRouteAuthValidationDecode = (qpqConfig: QPQConfig): RouteAuthValidationDecodeActionProcessor => {
  const decodeAuth = getProcessCustomImplementation<RouteAuthValidationDecodeActionProcessor>(
    qpqConfig,
    askRouteAuthValidationDecodeDefault,
    'Route Auth Validation Decode',
    null,
    () => new Date().toISOString(),
    generateUUID,
  );

  return async (payload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const [result, error] = await decodeAuth(payload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader, streamRegistry);

    if (error) {
      return actionResult(null);
    }

    return actionResult(result ?? null);
  };
};

export const getRouteAuthValidationDecodeActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [RouteAuthValidationActionType.Decode]: getProcessRouteAuthValidationDecode(qpqConfig),
});
