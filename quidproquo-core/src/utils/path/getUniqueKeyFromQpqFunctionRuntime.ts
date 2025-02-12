import { QpqFunctionRuntime } from '../../types';
import { isQpqFunctionRuntimeAbsolutePath } from './isQpqFunctionRuntimeAbsolutePath';

export function getUniqueKeyFromQpqFunctionRuntime(qpqFunctionRuntime: QpqFunctionRuntime): string {
  if (isQpqFunctionRuntimeAbsolutePath(qpqFunctionRuntime)) {
    return `${qpqFunctionRuntime.basePath}/${qpqFunctionRuntime.relativePath}::${qpqFunctionRuntime.functionName}`;
  }

  return qpqFunctionRuntime;
}
