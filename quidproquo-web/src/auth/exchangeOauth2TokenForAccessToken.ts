import { AuthenticationInfo } from 'quidproquo-core';

import { preformNetworkRequest } from '../request';

export async function exchangeOauth2TokenForAccessToken(code: string, authDomain: string): Promise<string | undefined> {
  const oAuth2Url = `https://${authDomain}/oauth2/token/${code}`;

  const result = await preformNetworkRequest<AuthenticationInfo>({
    method: 'POST',
    url: oAuth2Url,
    responseType: 'json',
  });

  console.log('result: ', result);

  return result.data.accessToken;
}

declare global {
  interface Window {
    exchangeOauth2TokenForAccessToken: any;
  }
}

window.exchangeOauth2TokenForAccessToken = exchangeOauth2TokenForAccessToken;
