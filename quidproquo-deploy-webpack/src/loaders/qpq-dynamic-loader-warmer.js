const path = require('path');

module.exports = function () {
  const config = JSON.parse(process.env.QPQLoaderConfig);
  const root = config.projectRoot;
  const uniqueSrcFiles = [...new Set(config.allSrcEntries)].filter(
    (sf) => !sf.startsWith('@QpqService/'),
  );

  const requireStatements = uniqueSrcFiles.map((e) => {
    const fullPath = path.join(root, e);
    const srcPath = fullPath.replace(/\\/g, '/');

    return `    require('${srcPath}')`;
  });

  const result = `module.exports = async () => {
  await Promise.all([
${requireStatements.join(',\n')}
  ]);
}`;

  console.log(result);

  return result;
};
