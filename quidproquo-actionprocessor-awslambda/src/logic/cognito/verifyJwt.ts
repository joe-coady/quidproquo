import { decodeValidJwt } from './decodeValidJwt';

export const verifyJwt = async (accessToken: string, userPoolId: string, region: string, ignoreExpiration: boolean = false): Promise<boolean> => {
  const info = await decodeValidJwt(userPoolId, region, ignoreExpiration, accessToken);

  // if we hav info, its valid
  return !!info;
};
