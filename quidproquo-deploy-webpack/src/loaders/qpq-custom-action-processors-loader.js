const path = require('path');

module.exports = function (source) {
  const config = JSON.parse(process.env.QPQLoaderConfig);

  const imports = config.customActionProcessorSources
    .map((src, i) => {
      return `const customActionProcessorImport${i} = require('./${src}');`;
    })
    .join('\n');

  const exports = config.customActionProcessorSources
    .map((_, i) => `  ...customActionProcessorImport${i}.default()`)
    .join('\n');

  const result = `${imports}

console.log(customActionProcessorImport0.default);

module.exports = () => ({
  ${exports}
})`;

  // console.log(result);

  return result;
};
