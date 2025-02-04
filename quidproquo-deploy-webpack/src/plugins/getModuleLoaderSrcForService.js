import { qpqCoreUtils } from 'quidproquo-core';

import { getSrcLoaderForQpqConfig } from './getSrcLoaderForQpqConfig';

export function getModuleLoaderSrcForService(qpqConfig, serviceNameVariableName, moduleNameVariableName) {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  const result = `
  if (${serviceNameVariableName} === String.raw\`${serviceName}\`) {
    ${getSrcLoaderForQpqConfig(qpqConfig, moduleNameVariableName)}
  }
  `;

  return result;
}
