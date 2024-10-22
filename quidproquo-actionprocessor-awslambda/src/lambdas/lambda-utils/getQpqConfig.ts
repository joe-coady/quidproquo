import { QPQConfig } from 'quidproquo-core';

// @ts-expect-error - Special webpack file injected
import { qpqConfig } from 'quidproquo-dynamic-loader';

export const getQpqConfig = (): QPQConfig => {
  return qpqConfig;
};
