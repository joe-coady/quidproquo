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

export function getSrcLoaderForQpqConfig(qpqConfig, moduleNameVariableName) {
  const uniqueSrcFiles = [...new Set([...qpqCoreUtils.getAllSrcEntries(qpqConfig), ...qpqWebServerUtils.getAllSrcEntries(qpqConfig)])];

  const caseStatements = [
    ...uniqueSrcFiles.map((e) => {
      const fullPath = getFullSrcPathFromQpqFunctionRuntime(e, qpqConfig);
      const method = qpqCoreUtils.getStoryNameFromQpqFunctionRuntime(e);
      const srcPath = fullPath.replace(/\\/g, '/');

      return `case String.raw\`${e}\`: {
        const module = await require('${srcPath}');
        if (!module) {
          throw new Error('Unable to dynamically load module');
        }

        const story = module['${method}'];
        if (!story) {
          throw new Error(\`Unable to dynamically load story: [${method}]\`);
        }

        return story;
      }`;
    }),

    `default: {
      console.log("Can't find module from list");

      throw new Error('Unable to dynamically load module, no matching file path, path must match exactly what is in qpqConfig.');
    }`,
  ];

  const result = `
  switch (${moduleNameVariableName}) {
    ${caseStatements.join('\n')}
  }
`;

  return result;
}
