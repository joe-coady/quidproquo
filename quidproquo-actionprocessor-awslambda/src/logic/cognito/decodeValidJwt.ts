import { CognitoJwtVerifier } from 'aws-jwt-verify';

export type AuthInfo = {
  userId: string;
  username: string;
};

export const decodeValidJwt = async (
  userPoolId: string,
  clientId: string,
  tokenType: 'id' | 'access',
  accessToken?: string,
): Promise<AuthInfo | null> => {
  if (!accessToken) {
    return null;
  }

  const verifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: tokenType,
    clientId: clientId,
  });

  try {
    const payload = await verifier.verify(accessToken);

    return {
      userId: payload.sub,
      username: payload.username?.toString() || '',
    };
  } catch (e) {
    console.log('Invalid jwt token', e);
    return null;
  }
};
