import path from 'path';

import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const config = (): Configuration => {
  return {
    mode: 'production',
    entry: path.resolve(__dirname, './src/index.tsx'),
    output: {
      path: path.resolve(__dirname, './lib'),
      filename: '[name].[contenthash].js',
      // libraryTarget: 'module',
      // module: true,
      // clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              compact: true,
              presets: [
                ['@babel/preset-env', { modules: false }], // Ensure modules are not transformed
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        src: path.resolve(__dirname, './src/'),
      },
      fallback: {
        path: require.resolve('path-browserify'),
      },
      mainFields: ['browser', 'module', 'main'], // prioritize ESM
    },
    optimization: {
      usedExports: true, // Enable tree shaking
      sideEffects: true, // Enable side effects detection

      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          default: {
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      },
      // runtimeChunk: {
      //   name: (entrypoint: { name: string }) => `runtime~${entrypoint.name}`,
      // },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: true,
      }),
      // new BundleAnalyzerPlugin({
      //   analyzerMode: 'static',
      //   openAnalyzer: true,
      // }),
    ],
  };
};

export default config;
