const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  target: 'async-node',
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  ignoreWarnings: [
    {
      module: /@module-federation/,
      message: /Failed to parse source map/,
    },
  ],
  output: {
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id]-[contenthash].js',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.js',
      exposes: {
        './multiply': './src/multiply.ts',
      },
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
      },
      runtimePlugins: [require.resolve('@module-federation/node/runtimePlugin')],
      remoteType: 'script',
      library: { type: 'commonjs-module', name: 'app2' },
    }),
  ],
};