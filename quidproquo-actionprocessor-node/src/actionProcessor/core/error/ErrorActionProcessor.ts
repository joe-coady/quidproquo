import { ErrorActionTypeEnum, ErrorThrowErrorActionPayload, StorySession } from 'quidproquo-core';

const processThrowError = async (payload: ErrorThrowErrorActionPayload, session: StorySession) => {
  throw new Error(`${payload.errorType}: ${payload.errorText || 'unknown error'}`);
};

export default {
  [ErrorActionTypeEnum.ThrowError]: processThrowError,
};
