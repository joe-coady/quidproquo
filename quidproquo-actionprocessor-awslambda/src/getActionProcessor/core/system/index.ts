import { QPQAWSLambdaConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';
import getExecuteStoryActionProcessor from './getExecuteStoryActionProcessor';

export default (runtimeConfig: QPQAWSLambdaConfig) => ({
  ...getExecuteStoryActionProcessor(runtimeConfig),
});
