import { defineAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { buildTestQpqConfig, UserDirectoryActionType } from 'quidproquo-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requestEmailVerificationCode } from '../../../logic/cognito/requestEmailVerificationCode';
import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getUserDirectoryRequestEmailVerificationActionProcessor } from './getUserDirectoryRequestEmailVerificationActionProcessor';

vi.mock('../../../logic/cognito/requestEmailVerificationCode', () => ({
  requestEmailVerificationCode: vi.fn(),
}));

const resolveProcessor = async () => {
  const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'eu-west-1')]);
  const processors = await getUserDirectoryRequestEmailVerificationActionProcessor(config, {} as any);
  return processors[UserDirectoryActionType.RequestEmailVerification];
};

describe('getUserDirectoryRequestEmailVerificationActionProcessor', () => {
  beforeEach(() => {
    vi.mocked(requestEmailVerificationCode).mockReset();
  });

  it('requests an email verification code for the access token', async () => {
    const processor = await resolveProcessor();

    const result = await invokeProcessor(processor, { userDirectoryName: 'users', accessToken: 'tok' });

    expect(result).toEqual([undefined]);
    expect(requestEmailVerificationCode).toHaveBeenCalledWith('eu-west-1', 'tok');
  });
});
