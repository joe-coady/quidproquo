import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { DecodedAccessToken, QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../awsNamingUtils';
import { getExportedValue } from '../cloudformation/getExportedValue';
import { decodeValidJwt } from './decodeValidJwt';

export const decodeAccessToken = async (
  userDirectoryName: string,
  qpqConfig: QPQConfig,
  accessToken?: string,
  ignoreExpiration: boolean = false,
): Promise<DecodedAccessToken> => {
  const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);
  const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

  const decodedAuthToken = await decodeValidJwt(userPoolId, region, ignoreExpiration, accessToken);

  if (!decodedAuthToken || !decodedAuthToken?.username) {
    throw new Error('Unable to decode access token');
  }

  const wasValid = !ignoreExpiration || decodedAuthToken.exp > Math.floor(Date.now() / 1000);

  const decodedAccesToken: DecodedAccessToken = {
    ...decodedAuthToken,

    wasValid,
    userDirectory: userDirectoryName,
  };

  return decodedAccesToken;
};
