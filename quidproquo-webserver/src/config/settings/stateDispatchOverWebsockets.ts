import { defineActionProcessors, QPQConfig } from 'quidproquo-core';

import { getServiceEntryQpqFunctionRuntime } from '../../services/getServiceEntryQpqFunctionRuntime';

export const defineStateDispatchOverWebsockets = (): QPQConfig => [
  defineActionProcessors(
    getServiceEntryQpqFunctionRuntime('webSocketQueue', 'actionProcessor', 'getStateDispatch::getStateDispatch')
  ),
];
