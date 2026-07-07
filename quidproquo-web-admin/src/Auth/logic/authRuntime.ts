import { createQpqRuntimeDefinition } from 'quidproquo-web-react';

import { authLogic } from './runtime/authLogic';
import { authInitalState, authReducer } from './authReducer';

export const authRuntime = createQpqRuntimeDefinition(authLogic, authInitalState, authReducer);
