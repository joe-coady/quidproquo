import path from 'path';

import { QpqFunctionRuntime } from 'quidproquo-core';

export const getServiceEntryQpqFunctionRuntime = (serviceName: string, entryType: string, runtime: `${string}::${string}`): QpqFunctionRuntime => {
  const [src, methodName] = runtime.split('::');

  const fullSrc = path.join(__dirname, serviceName, 'entry', entryType, src);

  return `full@${fullSrc}::${methodName}`;
};
