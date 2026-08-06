import { DynamicFunctionsActionType } from './DynamicFunctionsActionType';

// The full catalog of errors the Execute processor can produce itself. Errors
// thrown by a generator member's own story propagate with their original type.
export enum DynamicFunctionsExecuteErrorTypeEnum {
  // No defineDynamicFunctions setting registered under the name.
  DynamicFunctionsNotFound = 'DynamicFunctionsNotFound',
  // The dynamic module loader could not resolve the registered runtime.
  ModuleLoadFailed = 'ModuleLoadFailed',
  // The named member is not an own enumerable function on the loaded object.
  FunctionNotFound = 'FunctionNotFound',
  // A plain (non-story) member threw or rejected.
  FunctionThrew = 'FunctionThrew',
}

// The shape a registered export must have: an object of callable members. `any` is
// required here - member parameters are contravariant, so a Record over `unknown[]`
// args would reject every concretely-typed functions object.
export type DynamicFunctions = Record<string, (...args: any[]) => any>;

// What the processor hands back for a member: a generator member resolves to its
// story return value, a promise-returning member to its awaited value.
export type DynamicFunctionResult<TFn extends (...args: any[]) => any> =
  ReturnType<TFn> extends Generator<any, infer R, any> ? R : ReturnType<TFn> extends Promise<infer R> ? R : ReturnType<TFn>;

// Payload
export interface DynamicFunctionsExecuteActionPayload {
  dynamicFunctionsName: string;
  functionName: string;
  args: unknown[];
}
