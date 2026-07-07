import { QpqFunctionRuntime } from '../../types';
import { isQpqFunctionRuntimeAdvanced } from '../../utils';

export const getStoryNameFromQpqFunctionRuntime = (qpqFunctionRuntime: QpqFunctionRuntime): string => {
  if (isQpqFunctionRuntimeAdvanced(qpqFunctionRuntime)) {
    return qpqFunctionRuntime.functionName;
  }

  const [_srcPath, method] = qpqFunctionRuntime.split('::');

  return method;
};
