import {
  askLogCreate,
  askNetworkRequest,
  AskResponse,
  askThrowError,
  ErrorTypeEnum,
  LogLevelEnum,
} from 'quidproquo-core';
import { CloudflareResponse, CloudflareDNSRecord } from '../types';
import { CloudFlareDnsEntry } from '../../../types';

export function* askCloudFlareAddDNSRecord(
  apiKey: string,
  zoneId: string,
  cnameName: string,
  dnsEntryValue: CloudFlareDnsEntry,
): AskResponse<void> {
  const requestBody = {
    type: dnsEntryValue.type, // Use the type from the dnsEntryValue
    name: cnameName,
    content: dnsEntryValue.value,
    ttl: 1, // Automatic TTL
    proxied:
      typeof dnsEntryValue.proxied === 'string'
        ? (dnsEntryValue.proxied as string).toLowerCase() === 'true'
        : Boolean(dnsEntryValue.proxied),
  };

  yield* askLogCreate(LogLevelEnum.Info, `type of proxied: [${typeof dnsEntryValue.proxied}]`);

  const response = yield* askNetworkRequest<
    {
      type: 'CNAME' | 'A';
      name: string;
      content: string;
      ttl: number;
      proxied: boolean;
    },
    CloudflareResponse<CloudflareDNSRecord>
  >('POST', `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: requestBody,
  });

  console.log(JSON.stringify(response.data, null, 2));

  if (!response.data.success) {
    yield* askThrowError(
      ErrorTypeEnum.GenericError,
      `Failed to add CNAME record: ${response.data.errors.map((e) => e.message).join(', ')}`,
    );
  }
}
