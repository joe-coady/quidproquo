import path from 'path';

import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const config = (): Configuration => {
  return {
    mode: 'production',
    entry: path.resolve(__dirname, './src/index.tsx'),
    output: {
      path: path.resolve(__dirname, './lib'),
      filename: 'index.js',
    },

    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/i,
          exclude: [/node_modules/, /\.(spec|test).(ts|js)x?$/i],
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            compact: true,
          },
        },
      ],
    },

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      // absolute import paths
      alias: {
        src: path.resolve(__dirname, './src/'),
      },
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        // injecting the main.js into index.html
        inject: true,
      }),
    ],
  };
};

export default config;
