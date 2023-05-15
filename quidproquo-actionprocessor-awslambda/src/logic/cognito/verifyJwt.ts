import { decodeValidJwt } from './decodeValidJwt';

export const verifyJwt = async (
  accessToken: string,
  userPoolId: string,
  clientId: string,
  tokenType: 'id' | 'access',
): Promise<boolean> => {
  const info = await decodeValidJwt(userPoolId, clientId, tokenType, accessToken);

  // if we hav info, its valid
  return !!info;
};
