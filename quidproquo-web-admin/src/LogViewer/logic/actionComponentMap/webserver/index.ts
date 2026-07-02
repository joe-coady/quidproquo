import webserverAdminActionComponentMap from './webserverAdminActionComponentMap';
import webserverApiKeyValidationActionComponentMap from './webserverApiKeyValidationActionComponentMap';
import webserverDnsActionComponentMap from './webserverDnsActionComponentMap';
import webserverGenericDataResourceActionComponentMap from './webserverGenericDataResourceActionComponentMap';
import webserverOpenApiSpecActionComponentMap from './webserverOpenApiSpecActionComponentMap';
import webserverRouteAuthValidationActionComponentMap from './webserverRouteAuthValidationActionComponentMap';
import webserverServiceActionComponentMap from './webserverServiceActionComponentMap';
import webserverServiceFunctionActionComponentMap from './webserverServiceFunctionActionComponentMap';
import webserverWebEntryActionComponentMap from './webserverWebEntryActionComponentMap';
import webserverWebsocketActionComponentMap from './webserverWebsocketActionComponentMap';

export default {
  ...webserverAdminActionComponentMap,
  ...webserverApiKeyValidationActionComponentMap,
  ...webserverDnsActionComponentMap,
  ...webserverGenericDataResourceActionComponentMap,
  ...webserverOpenApiSpecActionComponentMap,
  ...webserverRouteAuthValidationActionComponentMap,
  ...webserverServiceActionComponentMap,
  ...webserverServiceFunctionActionComponentMap,
  ...webserverWebEntryActionComponentMap,
  ...webserverWebsocketActionComponentMap,
};
