const path = require('path');

module.exports = function (source) {
  const config = JSON.parse(process.env.QPQLoaderConfig);
  const root = config.projectRoot;
  const uniqueSrcFiles = [...new Set(config.allSrcEntries)].filter(
    (sf) => !sf.startsWith('@QpqService/'),
  );

  const ifStatements = uniqueSrcFiles.map((e) => {
    const fullPath = path.join(root, e);
    const srcPath = fullPath.replace(/\\/g, '/');

    return `if (moduleName === '${e}') {
      return await require('${srcPath}');
    }`;
  });

  const ifBlock = ifStatements.join(' else ');

  const result = `module.exports = async (moduleName) => {
    ${ifBlock};

    return null;
  }`;

  console.log(result);

  return result;
};
