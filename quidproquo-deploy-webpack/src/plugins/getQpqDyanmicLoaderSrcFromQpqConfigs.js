import { getSrcLoaderForQpqConfig } from './getSrcLoaderForQpqConfig';
import { getModuleLoaderSrcForService } from './getModuleLoaderSrcForService';

export const getQpqDyanmicLoaderSrcFromQpqConfigs = (qpqConfigs) => {
  const result = `
    export const qpqConfig = ${JSON.stringify(qpqConfigs[0], null, 2)};
    export const qpqConfigs = ${JSON.stringify(qpqConfigs, null, 2)};

    export const qpqDynamicModuleLoader = async (moduleName) => {
      ${getSrcLoaderForQpqConfig(qpqConfigs[0], 'moduleName')}

      // This will never get hit
      return null;
    };
    
    export const qpqDynamicModuleLoaderForService = async (serviceName, moduleName) => {
      ${qpqConfigs.map((qpqConfig) => getModuleLoaderSrcForService(qpqConfig, 'serviceName', 'moduleName')).join('')}

      // This will never get hit
      return null;
    };`;

  // console.log(result);

  return result;
};
