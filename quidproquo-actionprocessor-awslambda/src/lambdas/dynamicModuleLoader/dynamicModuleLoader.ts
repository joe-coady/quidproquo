// @ts-expect-error - Special webpack file injected
import { qpqDynamicModuleLoader } from 'quidproquo-dynamic-loader';

export const dynamicModuleLoader = async <T = any>(modulePath: string): Promise<T> => {
  return qpqDynamicModuleLoader(modulePath);
};
