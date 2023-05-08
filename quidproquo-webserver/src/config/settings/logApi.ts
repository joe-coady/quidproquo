import { QPQConfigSettings } from 'quidproquo-core';

import { defineRoute } from './route';
import { getServiceEntry } from '../../utils/serviceConfig';

export const defineLogApi = (): QPQConfigSettings => {
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

  console.log(JSON.stringify(configs, null, 2));

  return configs;
};
