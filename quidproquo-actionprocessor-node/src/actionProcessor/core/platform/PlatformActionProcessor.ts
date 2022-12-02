import { PlatformActionType, PlatformDelayActionProcessor, actionResult } from 'quidproquo-core';

const processPlatformDelay: PlatformDelayActionProcessor = async ({ timeMs }) => {
  return new Promise((resolve) => setTimeout(() => resolve(actionResult(undefined)), timeMs));
};

export default {
  [PlatformActionType.Delay]: processPlatformDelay,
};
