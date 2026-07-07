import { useQpqRuntime } from 'quidproquo-web-react';

import { getApplySessionEventActionProcessor } from '../actions/getApplySessionEventActionProcessor';
import { adminAppRuntime } from '../adminAppRuntime';

// The admin runtime + its ApplyEvent processor. The boot story runs once in
// AdminAppProvider; every other consumer mounts without a main story.
export const useAdminApp = () => useQpqRuntime(adminAppRuntime, undefined, undefined, getApplySessionEventActionProcessor);
