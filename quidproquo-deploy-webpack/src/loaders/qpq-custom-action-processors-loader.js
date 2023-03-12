const path = require('path');

module.exports = function (source) {
  const config = JSON.parse(process.env.QPQLoaderConfig);
  const root = config.projectRoot;

  const imports = config.customActionProcessorSources
    .map((src, i) => {
      const srcPath = path.join(root, src).replace(/\\/g, '/');
      return `const customActionProcessorImport${i} = require('${srcPath}');`;
    })
    .join('\n');

  const exports = config.customActionProcessorSources
    .map((_, i) => `  ...customActionProcessorImport${i}.default()`)
    .join(',\n');

  const result = `${imports}

module.exports = () => ({
  ${exports}
})`;

  // console.log(result);

  return result;
};
