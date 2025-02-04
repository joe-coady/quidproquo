import { LogActionType } from 'quidproquo-core';

import { CoreLogCreateCustomAction, CoreLogDisableEventHistoryCustomAction } from '../../custom';
import { ActionComponent } from '../../types';

const coreNetworkActionComponentMap: Record<string, ActionComponent> = {
  [LogActionType.Create]: CoreLogCreateCustomAction,
  [LogActionType.DisableEventHistory]: CoreLogDisableEventHistoryCustomAction,
};

export default coreNetworkActionComponentMap;
