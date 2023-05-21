import { verify, decode } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export type AuthInfo = {
  userId: string;
  username: string;
};

type JwtPayload = {
  sub: string;
  iss: string;
  client_id: string;
  origin_jti: string;
  event_id: string;
  token_use: string;
  scope: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  username: string;
};

export const decodeValidJwt = async (
  userPoolId: string,
  region: string,
  ignoreExpiration: boolean,
  accessToken?: string,
): Promise<AuthInfo | null> => {
  if (!accessToken) {
    return null;
  }

  try {
    const decodedToken = decode(accessToken, { complete: true });
    if (!decodedToken) {
      return null;
    }

    const client = jwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
    });

    const key = await client.getSigningKey(decodedToken.header.kid);
    const signingKey = key.getPublicKey();

    const payload = verify(accessToken, signingKey, {
      algorithms: ['RS256'],
      ignoreExpiration,
    }) as JwtPayload;

    return {
      userId: payload.sub,
      username: payload.username,
    };
  } catch (e) {
    console.log('Failed to decode jwt token', e);
    return null;
  }
};
