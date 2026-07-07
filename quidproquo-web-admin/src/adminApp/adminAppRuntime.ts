import { createQpqRuntimeDefinition } from 'quidproquo-web-react';

import { adminAppReducer } from './adminAppReducer';
import { createInitialAdminAppState } from './AdminAppState';
import { sharedAdminAppApi } from './sharedAdminAppApi';

export const adminAppRuntime = createQpqRuntimeDefinition(sharedAdminAppApi, createInitialAdminAppState(), adminAppReducer);
