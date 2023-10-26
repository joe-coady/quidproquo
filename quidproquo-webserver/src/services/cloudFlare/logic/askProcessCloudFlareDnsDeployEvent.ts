import { askConfigGetSecret, AskResponse } from 'quidproquo-core';
import {
  CloudFlareDnsDeployEvent,
  CloudFlareDnsDeployEventEnum,
  CloudFlareDnsDeployEventResponse,
} from '../../../types';
import { askCloudFlareGetZoneId } from './askCloudFlareGetZoneId';
import { askCloudFlareGetDNSRecordId } from './askCloudFlareGetDNSRecordId';
import { askCloudFlareDeleteDNSRecord } from './askCloudFlareDeleteDNSRecord';
import { askCloudFlareAddDNSRecord } from './askCloudflareAddDNSRecord';

export function getDnsEntryName(dnsEntryName: string, rootDomain: string) {
  if (dnsEntryName === rootDomain) {
    return '@';
  }

  return dnsEntryName;
}

export function* askProcessCloudFlareDnsDeployEvent(
  event: CloudFlareDnsDeployEvent,
): AskResponse<CloudFlareDnsDeployEventResponse> {
  const apiKey = yield* askConfigGetSecret(event.apiSecretName);

  // Get the site zone id
  const zoneId = yield* askCloudFlareGetZoneId(apiKey, event.siteDns);

  // If its an update, delete the old DNS entries
  if (event.RequestType === CloudFlareDnsDeployEventEnum.Update) {
    for (const oldDnsEntry of Object.keys(event.oldDnsEntries)) {
      const recordId = yield* askCloudFlareGetDNSRecordId(
        apiKey,
        zoneId,
        getDnsEntryName(oldDnsEntry, event.siteDns),
      );

      if (recordId) {
        yield* askCloudFlareDeleteDNSRecord(apiKey, zoneId, recordId);
      }
    }
  }

  // If its a delete, delete the current DNS entries
  if (event.RequestType === CloudFlareDnsDeployEventEnum.Delete) {
    for (const dnsEntry of Object.keys(event.dnsEntries)) {
      const recordId = yield* askCloudFlareGetDNSRecordId(
        apiKey,
        zoneId,
        getDnsEntryName(dnsEntry, event.siteDns),
      );

      if (recordId) {
        yield* askCloudFlareDeleteDNSRecord(apiKey, zoneId, recordId);
      }
    }
  }

  // If its an update or create, add the new DNS entries
  if (
    event.RequestType === CloudFlareDnsDeployEventEnum.Update ||
    event.RequestType === CloudFlareDnsDeployEventEnum.Create
  ) {
    for (const dnsEntry of Object.keys(event.dnsEntries)) {
      const recordId = yield* askCloudFlareGetDNSRecordId(
        apiKey,
        zoneId,
        getDnsEntryName(dnsEntry, event.siteDns),
      );

      if (recordId) {
        yield* askCloudFlareDeleteDNSRecord(apiKey, zoneId, recordId);
      }

      yield* askCloudFlareAddDNSRecord(
        apiKey,
        zoneId,
        getDnsEntryName(dnsEntry, event.siteDns),
        event.dnsEntries[dnsEntry],
      );
    }
  }
}
