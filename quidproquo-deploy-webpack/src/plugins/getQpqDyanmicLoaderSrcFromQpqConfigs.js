import { getModuleLoaderSrcForService } from './getModuleLoaderSrcForService';
import { getSrcLoaderForQpqConfig } from './getSrcLoaderForQpqConfig';

export const getQpqDyanmicLoaderSrcFromQpqConfigs = (qpqConfigs) => {
  const result = `
    export const qpqConfig = ${JSON.stringify(qpqConfigs[0], null, 2)};
    export const qpqConfigs = ${JSON.stringify(qpqConfigs, null, 2)}; 

    export const qpqDynamicModuleLoader = async (qpqFunctionRuntime) => {
      ${getSrcLoaderForQpqConfig(qpqConfigs[0], 'qpqFunctionRuntime')}

      // This will never get hit
      return null;
    };
    
    export const qpqDynamicModuleLoaderForService = async (serviceName, qpqFunctionRuntime) => {
      ${qpqConfigs.map((qpqConfig) => getModuleLoaderSrcForService(qpqConfig, 'serviceName', 'qpqFunctionRuntime')).join('')}

      // This will never get hit
      return null;
    };`;

  // console.log(result);

  return result;
};
