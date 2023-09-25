import { AuthenticateUserResponse } from "quidproquo-core";

import { apiRequestPost } from '../../logic';
import { QpqLogListLog, StoryResultMetadataLog } from '../../types';

export const login = async (
  username: string,
  password: string,
): Promise<AuthenticateUserResponse> => {
  var logs: StoryResultMetadataLog[] = [];
  var newLogs: QpqLogListLog;
  var nextPageKey = undefined;

  const loginPayload = {
    username,
    password,
  };

  const response = await apiRequestPost<AuthenticateUserResponse>('/login', loginPayload);

  return response;
};
