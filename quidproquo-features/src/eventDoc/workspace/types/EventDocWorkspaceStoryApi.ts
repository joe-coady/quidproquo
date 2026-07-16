import { AskResponse } from 'quidproquo-core';

// A bag of scope-blind domain verbs (generator functions that yield
// askApplyEventDocEvent). bindEventDocWorkspaceApi maps over this shape and returns it
// signature-identical, so the same api can be mounted at n slot keys.
export type EventDocWorkspaceStoryApi = Record<string, (...args: any[]) => AskResponse<any>>;
