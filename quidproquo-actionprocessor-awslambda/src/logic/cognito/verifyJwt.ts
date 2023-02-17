import { CognitoJwtVerifier } from 'aws-jwt-verify';

export const verifyJwt = async (
  accessToken: string,
  userPoolId: string,
  clientId: string,
  tokenType: 'id' | 'access',
): Promise<boolean> => {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: tokenType,
    clientId: clientId,
  });

  try {
    const payload = await verifier.verify(accessToken);

    console.log('verify: ', JSON.stringify(payload, null, 2));

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
