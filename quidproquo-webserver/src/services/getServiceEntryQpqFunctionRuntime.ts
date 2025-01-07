import { joinPaths, QpqFunctionRuntime } from 'quidproquo-core';

export const getServiceEntryQpqFunctionRuntime = (serviceName: string, entryType: string, runtime: `${string}::${string}`): QpqFunctionRuntime => {
  const [src, methodName] = runtime.split('::');

  const fullSrc = joinPaths(__dirname, serviceName, 'entry', entryType, src);

  return `full@${fullSrc}::${methodName}`;
};
