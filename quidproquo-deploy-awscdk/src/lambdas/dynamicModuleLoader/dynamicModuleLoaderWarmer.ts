// @ts-ignore - Special webpack loader
import qpqDynamicModuleLoaderWarmer from 'qpq-dynamic-loader-warmer!';

export const dynamicModuleLoaderWarmer = async (): Promise<any> => {
  console.log(`using dynamicModuleLoaderWarmer`);
  return qpqDynamicModuleLoaderWarmer();
};
