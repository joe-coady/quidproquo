import webserverServiceFunctionActionComponentMap from './webserverServiceFunctionActionComponentMap';
import webserverWebEntryActionComponentMap from './webserverWebEntryActionComponentMap';
import webserverWebsocketActionComponentMap from './webserverWebsocketActionComponentMap';

export default {
  ...webserverServiceFunctionActionComponentMap,
  ...webserverWebEntryActionComponentMap,
  ...webserverWebsocketActionComponentMap,
};
