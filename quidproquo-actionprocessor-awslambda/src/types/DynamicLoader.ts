import { QpqFunctionRuntime } from 'quidproquo-core';

export type DynamicModuleLoader = (runtime: QpqFunctionRuntime) => Promise<any>;
