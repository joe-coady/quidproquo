import { QPQConfig } from 'quidproquo-core';

import getConfigGetParameterActionProcessor from './getConfigGetParameterActionProcessor';
import getConfigGetParametersActionProcessor from './getConfigGetParametersActionProcessor';
import getConfigGetSecretActionProcessor from './getConfigGetSecretActionProcessor';
import getConfigGetGlobalActionProcessor from './getConfigGetGlobalActionProcessor';
import getConfigSetParameterActionProcessor from './getConfigSetParameterActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getConfigGetParameterActionProcessor(qpqConfig),
  ...getConfigGetParametersActionProcessor(qpqConfig),
  ...getConfigGetSecretActionProcessor(qpqConfig),
  ...getConfigGetGlobalActionProcessor(qpqConfig),
  ...getConfigSetParameterActionProcessor(qpqConfig),
});
