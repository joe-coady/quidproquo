import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import getConfigGetSecretActionProcessor from './getConfigGetSecretActionProcessor';

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  ...getConfigGetSecretActionProcessor(runtimeConfig),
});
