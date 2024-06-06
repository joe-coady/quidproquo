import path from 'path';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

const lambdaRuntimes = [
  'lambdaAPIGatewayEvent',
  'lambdaAPIGatewayEvent_redirect',
  'lambdaWebsocketAPIGatewayEvent',
  'lambdaEventBridgeEventStackDeploy',
  'lambdaEventBridgeEvent',
  'lambdaEventOriginRequest',
  'lambdaEventViewerRequest',
  'lambdaServiceFunctionExecute',
  'lambdaSQSEvent',
  'lambdaS3FileEvent',
  'lambdaCognitoTriggerEvent_CustomMessage',
];

const buildPath = path.resolve(__dirname, 'lib', 'bundled', 'lambda'); // Adjust the build path as necessary

const entry = lambdaRuntimes.reduce((acc, name) => ({ 
  ...acc, 
  [name]: path.join(__dirname, `src/lambdas/${name}.ts`) 
}), {});

const webpackConfig = {
  entry: entry,
  mode: 'production',
  externals: [/aws-sdk/],
  target: 'node',
  output: {
    path: buildPath,
    filename: '[name]/index.js',
    globalObject: 'this',
    libraryTarget: 'commonjs2',
    publicPath: 'auto'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: {
      path: require.resolve('path-browserify'),
      crypto: false,
    },
  },
  optimization: {
    splitChunks: false,
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-typescript'],
        },
      },
      {
        test: /\.(yaml|json)$/,
        type: 'asset/source',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'qpq-fed',
      filename: 'remoteEntry.js',
      // runtimePlugins: [
      //   path.join(__dirname, 'src', 'plugin', 's3LoaderPlugin')
      // ]

      remotes: {
        app2: 'app2@https://code-kitted-account-development-joecoady-qpqapi.s3.us-east-1.amazonaws.com/remoteEntry.js',
      },
    }),
  ],
};

export default webpackConfig;
