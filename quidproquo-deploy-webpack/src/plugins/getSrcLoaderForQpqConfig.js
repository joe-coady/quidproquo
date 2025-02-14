import { isQpqFunctionRuntimeAbsolutePath, qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import path from 'path';

export const getFullSrcPathFromQpqFunctionRuntime = (qpqFunctionRuntime, qpqConfig) => {
  if (isQpqFunctionRuntimeAbsolutePath(qpqFunctionRuntime)) {
    return path.join(qpqFunctionRuntime.basePath, qpqFunctionRuntime.relativePath);
  }

  const [srcPath] = qpqFunctionRuntime.split('::');

  const configRoot = qpqCoreUtils.getApplicationConfigRoot(qpqConfig);

  return path.join(configRoot, srcPath);
};

export function getSrcLoaderForQpqConfig(qpqConfig, qpqFunctionRuntimeVariableName) {
  const allQpqFunctionRuntimes = [...qpqCoreUtils.getAllSrcEntries(qpqConfig), ...qpqWebServerUtils.getAllSrcEntries(qpqConfig)];

  const ifStatements = allQpqFunctionRuntimes.map((qpqFunctionRuntime) => {
    const fullPath = getFullSrcPathFromQpqFunctionRuntime(qpqFunctionRuntime, qpqConfig);
    const method = qpqCoreUtils.getStoryNameFromQpqFunctionRuntime(qpqFunctionRuntime);
    const srcPath = path.posix.join(fullPath.replace(/\\/g, '/')); // Ensure proper path format

    return `
      if (typeof ${qpqFunctionRuntimeVariableName} === '${typeof qpqFunctionRuntime}' && !!${qpqFunctionRuntimeVariableName}) {
        if (
          ${
            typeof qpqFunctionRuntime === 'string'
              ? `(${qpqFunctionRuntimeVariableName} === String.raw\`${qpqFunctionRuntime}\`)`
              : `(
                ${qpqFunctionRuntimeVariableName}.basePath === String.raw\`${qpqFunctionRuntime.basePath}\` &&
                ${qpqFunctionRuntimeVariableName}.relativePath === String.raw\`${qpqFunctionRuntime.relativePath}\` &&
                ${qpqFunctionRuntimeVariableName}.functionName === String.raw\`${qpqFunctionRuntime.functionName}\`
              )`
          }
        ) {
          const module = await require('${srcPath}');
          if (!module) {
            throw new Error('Unable to dynamically load module');
          }

          const story = module['${method}'];
          if (!story) {
            throw new Error(\`Unable to dynamically load story: [${method}]\`);
          }

          return story;
        }
      }
`;
  });

  return ifStatements.join('\n');
}
