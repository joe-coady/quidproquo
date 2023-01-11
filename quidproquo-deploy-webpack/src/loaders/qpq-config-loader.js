const path = require('path');

module.exports = function () {
  const config = JSON.parse(process.env.QPQLoaderConfig);

  const result = `module.exports = ${JSON.stringify(config.qpqConfig, null, 2)}`;

  // console.log(result);

  return result;
};
