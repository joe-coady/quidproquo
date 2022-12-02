// NOTE:  The following actions have no platform specific processors and/or requestors
//        and therefore do not need to implement a SystemActionProcessor.ts
//
// * SystemActionType.Batch
//

export enum SystemActionType {
  Batch = '@quidproquo-core/System/Batch',
  ExecuteStory = '@quidproquo-core/System/ExecuteStory',

  // This isn't needed as its just a hybrid runtime method for SystemBatch
  // RunParallel = '@quidproquo-core/System/RunParallel',
}
