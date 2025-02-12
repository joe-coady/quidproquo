import { QpqFunctionRuntimeAbsolutePath } from 'quidproquo-core';

export const getServiceEntryQpqFunctionRuntime = (
  serviceName: string,
  entryType: string,
  // TODO: runtime should maybe be QpqFunctionRuntimeRelativePath
  runtime: `${string}::${string}`,
): QpqFunctionRuntimeAbsolutePath => {
  const [src, methodName] = runtime.split('::');

  return {
    basePath: __dirname,
    relativePath: `${serviceName}/entry/${entryType}/${src}`,
    functionName: methodName,
  };
};
