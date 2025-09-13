import { QpqFunctionRuntime } from '../../types';
import { isQpqFunctionRuntimeAbsolutePath } from '../../utils';

export const getStoryNameFromQpqFunctionRuntime = (qpqFunctionRuntime: QpqFunctionRuntime): string => {
  if (isQpqFunctionRuntimeAbsolutePath(qpqFunctionRuntime)) {
    return qpqFunctionRuntime.functionName;
  }

  const [_srcPath, method] = qpqFunctionRuntime.split('::');

  return method;
};