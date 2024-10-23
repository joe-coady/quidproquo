import { OpenApiSpecActionType } from './OpenApiSpecActionType';
import { OpenApiSpecGetOpenApiSpecActionRequester } from './OpenApiSpecGetOpenApiSpecActionTypes';

export function* askGetOpenApiSpec(): OpenApiSpecGetOpenApiSpecActionRequester {
  return yield { type: OpenApiSpecActionType.GetOpenApiSpec };
}
