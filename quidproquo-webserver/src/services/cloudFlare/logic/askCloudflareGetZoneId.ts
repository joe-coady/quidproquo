import { askNetworkRequest, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { CloudflareResponse, CloudflareZone } from '../types';

export function* askCloudflareGetZoneId(
  apiKey: string,
  siteDomainName: string,
): AskResponse<string> {
  const response = yield* askNetworkRequest<void, CloudflareResponse<CloudflareZone>>(
    'GET',
    `https://api.cloudflare.com/client/v4/zones?name=${siteDomainName}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const zoneId = response.data.result[0]?.id;

  if (!zoneId) {
    yield* askThrowError(ErrorTypeEnum.GenericError, `No zoneId found for [${siteDomainName}]`);
  }

  return zoneId;
}
