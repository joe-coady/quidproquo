import { ExcludeKeys, NetworkRequestActionPayload } from 'quidproquo';

import { QpqjsServiceEnum } from '@qpqjs/constants';

export type AdminNetworkRequestPayload = ExcludeKeys<
  NetworkRequestActionPayload<string>,
  'responseType' | 'basePath'
> & {
  service: QpqjsServiceEnum;
};
