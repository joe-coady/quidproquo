import { QpqFunctionRuntime, QpqFunctionRuntimeAbsolutePath } from '../../types';

export function isQpqFunctionRuntimeAbsolutePath(qpqFunctionRuntime: QpqFunctionRuntime): qpqFunctionRuntime is QpqFunctionRuntimeAbsolutePath {
  return typeof qpqFunctionRuntime === 'object';
}
