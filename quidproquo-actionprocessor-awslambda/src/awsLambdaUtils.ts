import { StorageClass  } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { match } from 'node-match-path';
import { StorageDriveTier } from 'quidproquo-core';

export const randomGuid = () => {
  return randomUUID();
};

export interface UrlMatch {
  didMatch: boolean;
  params: Record<string, string> | null;
}

export const matchUrl = (path: string, url: string): UrlMatch => {
  // /attempt/{attemptUuid}/result/{test} => /attempt/:attemptUuid/result/:test
  const modifiedPath = path.replaceAll(/{(.+?)}/g, (m, g) => `:${g}`);

  const matchResult = match(modifiedPath, url);
  return {
    didMatch: matchResult.matches,
    params: matchResult.params,
  };
};

export const getS3BucketStorageClassFromStorageDriveTier = (driveTier?: StorageDriveTier): keyof typeof StorageClass => {
  switch (driveTier) {
      case StorageDriveTier.REGULAR:
        return "STANDARD";
      case StorageDriveTier.OCCASIONAL_ACCESS:
        return "STANDARD_IA";
      case StorageDriveTier.SINGLE_ZONE_OCCASIONAL_ACCESS:
        return "ONEZONE_IA";
      case StorageDriveTier.COLD_STORAGE:
        return "GLACIER";
      case StorageDriveTier.COLD_STORAGE_INSTANT_ACCESS:
        return "GLACIER_IR";
      case StorageDriveTier.DEEP_COLD_STORAGE:
        return "DEEP_ARCHIVE";
      case StorageDriveTier.SMART_TIERING:
        return "INTELLIGENT_TIERING";
      default:
        return "INTELLIGENT_TIERING";
  }
}