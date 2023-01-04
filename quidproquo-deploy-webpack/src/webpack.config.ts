import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

const getWebpackBuildMode = (qpqConfig: QPQConfig): string => {
  const feature = qpqCoreUtils.getAppFeature(qpqConfig);

  if (['development', 'production'].indexOf(feature) >= 0) {
    return feature;
  }

  return 'production';
};

export const getWebpackConfig = (qpqConfig: QPQConfig, buildPath: string, outputPrefix: string) => {
  const allSrcEntries = [
    ...qpqCoreUtils.getAllSrcEntries(qpqConfig),
    ...qpqWebServerUtils.getAllSrcEntries(qpqConfig),
  ];

  return {
    entry: allSrcEntries.reduce(
      (entry, path) => ({
        ...entry,
        [`./${outputPrefix}/${path}`]: `./${path}`,
      }),
      {},
    ),

    mode: getWebpackBuildMode(qpqConfig),

    // We should: sort out how to split the bundles and get it to work on aws
    // optimization: {
    //   splitChunks: {
    //     // include all types of chunks
    //     chunks: "all",
    //   },
    // },

    output: {
      // Output path
      path: buildPath,

      // Allow compiling as a lib ~ don't tree shake my exports plz
      globalObject: 'this',
      libraryTarget: 'umd',
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.(ts)$/,
          loader: 'babel-loader',
          options: {
            // without additional settings, this will reference .babelrc
            presets: ['@babel/preset-typescript'],
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(yaml|json)$/,
          type: 'asset/source',
          exclude: /node_modules/,
        },
      ],
    },
  };
};
