import { createQpqRuntimeDefinition } from '../hooks/asmj/createQpqRuntimeDefinition';
import { sharedQueryParamsLogic } from './logic/runtime';
import { sharedQueryParamsInitalState, sharedQueryParamsReducer } from './logic';

export const sharedQueryParamsRuntime = createQpqRuntimeDefinition(sharedQueryParamsLogic, sharedQueryParamsInitalState, sharedQueryParamsReducer);
