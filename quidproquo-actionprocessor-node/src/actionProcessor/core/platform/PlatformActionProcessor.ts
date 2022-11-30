import { PlatformActionTypeEnum } from "quidproquo-core";

const processDelay = async (payload: any, session: any) => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(undefined), payload.timeMs as number)
  );
};

export default {
  [PlatformActionTypeEnum.Delay]: processDelay,
};
