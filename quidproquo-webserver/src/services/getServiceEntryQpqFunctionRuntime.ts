import { QpqFunctionRuntime } from 'quidproquo-core';

import path from 'path';

export const getServiceEntryQpqFunctionRuntime = (serviceName: string, entryType: string, runtime: `${string}::${string}`): QpqFunctionRuntime => {
  const [src, methodName] = runtime.split('::');

  const fullSrc = path.join(__dirname, serviceName, 'entry', entryType, src);

  return `full@${fullSrc}::${methodName}`;
};
