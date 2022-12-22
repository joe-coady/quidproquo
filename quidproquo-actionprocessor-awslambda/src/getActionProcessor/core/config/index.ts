import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';

import getConfigGetParameterActionProcessor from './getConfigGetParameterActionProcessor';
import getConfigGetParametersActionProcessor from './getConfigGetParametersActionProcessor';
import getConfigGetSecretActionProcessor from './getConfigGetSecretActionProcessor';

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  ...getConfigGetParameterActionProcessor(runtimeConfig),
  ...getConfigGetParametersActionProcessor(runtimeConfig),
  ...getConfigGetSecretActionProcessor(runtimeConfig),
});
