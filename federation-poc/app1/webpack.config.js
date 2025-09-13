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
    clean: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: { './add': './src/add.ts' },

      // Load app2’s container from the filesystem using dynamic import()
      remotes: {
        app2: 'app2@/remoteEntry.js',
      },

      runtimePlugins: [require.resolve('@module-federation/node/runtimePlugin')],
      remoteType: 'script',

      // keep if app1 is ALSO a remote
      library: { type: 'commonjs-module', name: 'app1' },
    }),
  ],
};
