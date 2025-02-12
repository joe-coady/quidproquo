import { QpqFunctionRuntime } from 'quidproquo-core';
// @ts-expect-error - Special webpack file injected
import { qpqDynamicModuleLoader } from 'quidproquo-dynamic-loader';

export const dynamicModuleLoader = async <T = any>(modulePath: QpqFunctionRuntime): Promise<T> => {
  return qpqDynamicModuleLoader(modulePath);
};
