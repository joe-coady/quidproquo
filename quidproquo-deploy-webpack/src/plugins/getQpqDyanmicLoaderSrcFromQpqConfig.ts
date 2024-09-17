import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

export const getQpqDyanmicLoaderSrcFromQpqConfig = (qpqConfig: QPQConfig) => {
  const uniqueSrcFiles = [...qpqCoreUtils.getAllSrcEntries(qpqConfig), ...qpqWebServerUtils.getAllSrcEntries(qpqConfig)].filter(
    (sf, index, arr) => arr.indexOf(sf) === index,
  );

  const caseStatements = [
    ...uniqueSrcFiles.map((e) => {
      const fullPath = qpqCoreUtils.getFullSrcPathFromQpqFunctionRuntime(e, qpqConfig);
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

  const result = `export const qpqConfig = ${JSON.stringify(qpqConfig, null, 2)};

  export const qpqDynamicModuleLoader = async (moduleName) => {
    switch (moduleName) {
      ${caseStatements.join('\n')}
    }

    // This will never get hit
    return null;
  };`;

  console.log(result);

  return result;
};
