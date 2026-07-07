import { OpenApiSpecActionType } from 'quidproquo-webserver';

const webserverOpenApiSpecActionComponentMap: Record<string, string[]> = {
  [OpenApiSpecActionType.GetOpenApiSpec]: ['askGetOpenApiSpec'],
};

export default webserverOpenApiSpecActionComponentMap;
