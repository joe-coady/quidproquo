import { DynamicFunctionsExecuteErrorTypeEnum } from 'quidproquo-core';

// True when a dynamic-functions execute failed because the collection has no registered
// functions object (definition-less collection) or the object lacks the member (e.g. no
// render on a leaf doc type) - the two errors that mean "not configured", as opposed to a
// configured function that failed. ModuleLoadFailed is deliberately NOT here: a
// registered object that cannot load is a broken deployment and must stay loud.
export const isEventDocFunctionsMissing = (errorType: string): boolean =>
  errorType === DynamicFunctionsExecuteErrorTypeEnum.DynamicFunctionsNotFound || errorType === DynamicFunctionsExecuteErrorTypeEnum.FunctionNotFound;
