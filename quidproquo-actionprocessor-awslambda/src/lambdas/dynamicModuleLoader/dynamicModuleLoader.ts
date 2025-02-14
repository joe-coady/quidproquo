import { QpqFunctionRuntime } from 'quidproquo-core';
// @ts-expect-error - Special webpack file injected
import { qpqDynamicModuleLoader } from 'quidproquo-dynamic-loader';

export const dynamicModuleLoader = async <T = any>(qpqFunctionRuntime: QpqFunctionRuntime): Promise<T> => {
  return qpqDynamicModuleLoader(qpqFunctionRuntime);
};
