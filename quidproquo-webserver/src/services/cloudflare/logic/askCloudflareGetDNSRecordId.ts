import { askNetworkRequest, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { CloudflareResponse, CloudflareDNSRecord } from '../types';

export function* askCloudflareGetDNSRecordId(
  apiKey: string,
  zoneId: string,
  cnameName: string,
): AskResponse<string | undefined> {
  const response = yield* askNetworkRequest<void, CloudflareResponse<CloudflareDNSRecord>>(
    'GET',
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${cnameName}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status < 200 || response.status >= 300) {
    yield* askThrowError(ErrorTypeEnum.GenericError, `Error getting DNS record for [${cnameName}]`);
  }

  // Filter out all the non-cname records
  const filteredRecords = response.data.result.filter(
    (record) => record.type === 'CNAME' || record.type === 'A',
  );

  return filteredRecords[0]?.id;
}
