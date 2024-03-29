import coreContextActionComponentMap from './coreContextActionComponentMap';
import coreUserDirectoryActionComponentMap from './coreUserDirectoryActionComponentMap';
import coreServiceFunctionActionComponentMap from './coreServiceFunctionActionComponentMap';
import coreKeyValueStoreActionComponentMap from './coreKeyValueStoreActionComponentMap';
import coreWebsocketActionComponentMap from './coreWebsocketActionComponentMap';

export default {
  ...coreContextActionComponentMap,
  ...coreKeyValueStoreActionComponentMap,
  ...coreServiceFunctionActionComponentMap,
  ...coreUserDirectoryActionComponentMap,
  ...coreWebsocketActionComponentMap,
};
