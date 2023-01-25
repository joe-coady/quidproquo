const path = require('path');

module.exports = function (source) {
  const config = JSON.parse(process.env.QPQLoaderConfig);
  const root = config.projectRoot;
  const ifStatements = config.allSrcEntries.map((e) => {
    const srcPath = path.join(root, e).replace(/\\/g, '/');

    return `if (moduleName === '${e}') {
      return await require('${srcPath}');
    }`;
  });

  const ifBlock = ifStatements.join(' else ');

  const result = `module.exports = async (moduleName) => {
    ${ifBlock};

    return null;
  }`;

  // console.log(result);

  return result;
};
