module.exports = function (source) {
  const config = JSON.parse(process.env.QPQLoaderConfig);
  const userDirectoryEmailTemplates = config.userDirectoryEmailTemplates;

  const result = `module.exports = ${JSON.stringify(userDirectoryEmailTemplates, null, 2)};`;

  // console.log(result);

  return result;
};
