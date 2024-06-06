import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

const s3LoaderPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 's3-loader-plugin',

    beforeInit(args) {
      console.log('plugin - beforeInit: ', args);
      return args;
    },

    init(args) {
      console.log('plugin - init: ', args);
    },

    beforeRequest(args) {
      console.log('plugin - beforeRequest: ', args);
      return args;
    },

    afterResolve(args) {
      console.log('plugin - afterResolve', args);
      return args;
    },

    onLoad(args) {
      console.log('plugin - onLoad: ', args);
      return args;
    },

    async loadShare(args) {
      console.log('plugin - loadShare:', args);
    },

    async beforeLoadShare(args) {
      console.log('plugin - beforeloadShare:', args);
      return args;
    },

    resolveShare(args) {
      console.log('plugin - loadShare:', args);
      return args;
    },

    createScript({ url }) {
      console.log('plugin - createScript:', url);
    }
  };
};

export default s3LoaderPlugin;
