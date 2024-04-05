import { CoreNetworkRequestCustomAction } from '../../custom/CoreNetworkRequestCustomAction';
import { ActionComponent } from '../../types';

const coreNetworkActionComponentMap: Record<string, ActionComponent> = {
  ['@quidproquo-core/Network/Request']: CoreNetworkRequestCustomAction,
};

export default coreNetworkActionComponentMap;
