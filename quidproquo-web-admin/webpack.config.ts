import path from 'path';

import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import packageJson from './package.json';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

interface WebpackConfiguration extends Configuration {
  devServer?: DevServerConfiguration;
}

const config = (): WebpackConfiguration => {
  return {
    mode: 'production',
    entry: path.resolve(__dirname, './src/index.tsx'),
    output: {
      path: path.resolve(__dirname, './lib'),
      filename: '[name].[contenthash].js',
      // libraryTarget: 'module',
      // module: true,
      // clean: true,
      publicPath: 'auto',
    },
    devServer: {
      port: 3001,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
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
      new ModuleFederationPlugin({
        name: 'qpq_admin_fm',
        filename: 'remoteEntry.js',
        exposes: {
          // Set the modules to be exported, default export as '.'
          './addonSupport': './src/addonSupport',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: packageJson.dependencies.react,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: packageJson.dependencies['react-dom'],
          },
          'quidproquo-web-react': {
            singleton: true,
            // requiredVersion: packageJson.devDependencies['quidproquo-web-react'],
          },
        },
      }),
    ],
  };
};

export default config;
