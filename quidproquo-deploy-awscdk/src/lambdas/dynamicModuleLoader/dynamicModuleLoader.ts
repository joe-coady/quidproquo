// @ts-ignore - Special webpack loader
import qpqDynamicModuleLoader from 'qpq-dynamic-loader!';

export const dynamicModuleLoader = async (modulePath: string): Promise<any> => {
  return qpqDynamicModuleLoader(modulePath);
};
