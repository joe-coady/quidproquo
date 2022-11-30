// NOTE: System actions have no platform specific processors and/or requestors
// and therefore do not need to implement a SystemActionProcessor.ts

export enum SystemActionTypeEnum {
  Batch = "@quidproquo-core/System/Batch",
  ExecuteStory = "@quidproquo-core/System/ExecuteStory",
}

export default SystemActionTypeEnum;
