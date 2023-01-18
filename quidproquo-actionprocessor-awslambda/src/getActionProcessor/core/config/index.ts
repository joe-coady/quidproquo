import { QPQConfig } from 'quidproquo-core';
import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';

import getConfigGetParameterActionProcessor from './getConfigGetParameterActionProcessor';
import getConfigGetParametersActionProcessor from './getConfigGetParametersActionProcessor';
import getConfigGetSecretActionProcessor from './getConfigGetSecretActionProcessor';

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => ({
  ...getConfigGetParameterActionProcessor(qpqConfig, awsResourceMap),
  ...getConfigGetParametersActionProcessor(qpqConfig, awsResourceMap),
  ...getConfigGetSecretActionProcessor(qpqConfig, awsResourceMap),
});
