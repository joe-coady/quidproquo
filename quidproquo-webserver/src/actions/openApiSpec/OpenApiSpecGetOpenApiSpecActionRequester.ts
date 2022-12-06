import { OpenApiSpecGetOpenApiSpecActionRequester } from './OpenApiSpecGetOpenApiSpecActionTypes';
import { OpenApiSpecActionType } from './OpenApiSpecActionType';

export function* askGetOpenApiSpec(): OpenApiSpecGetOpenApiSpecActionRequester {
  return yield { type: OpenApiSpecActionType.GetOpenApiSpec };
}
