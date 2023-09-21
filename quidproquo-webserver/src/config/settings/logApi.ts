import { QPQConfig, getServiceEntry } from 'quidproquo-core';

import { defineRoute } from './route';

export const defineLogApi = (): QPQConfig => {
  // comment
  const configs = [
    defineRoute(
      'POST',
      '/log/list',
      getServiceEntry('log', 'controller', 'logController'),
      'getLogs',
    ),
    defineRoute(
      'GET',
      '/log/{correlationId}',
      getServiceEntry('log', 'controller', 'logController'),
      'getLog',
    ),
    defineRoute(
      'GET',
      '/log/metadata/{correlationId}',
      getServiceEntry('log', 'controller', 'logController'),
      'getLogMetadata',
    ),
    defineRoute(
      'GET',
      '/log/children/{correlationId}',
      getServiceEntry('log', 'controller', 'logController'),
      'getLogMetadataChildren',
    ),
  ];

  return configs;
};
