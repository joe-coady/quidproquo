import { QPQConfig } from 'quidproquo-core';

import { defineRoute } from './route';
import { getServiceEntry } from '../../utils/serviceConfig';

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
  ];

  return configs;
};
