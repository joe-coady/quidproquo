import { createActionRequester } from 'quidproquo-core';

import { OpenApiSpecActionType } from './OpenApiSpecActionType';

export const askGetOpenApiSpec = createActionRequester<string>()({
  actionType: OpenApiSpecActionType.GetOpenApiSpec,
});
