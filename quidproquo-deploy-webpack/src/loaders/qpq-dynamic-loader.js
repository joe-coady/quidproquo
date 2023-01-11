const path = require('path');

module.exports = function (source) {
  const config = JSON.parse(process.env.QPQLoaderConfig);
  const ifStatements = config.allSrcEntries.map((e) => {
    return `if (moduleName === '${e}') {
      return await require('./${e.replace(/\\/g, '/')}');
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
