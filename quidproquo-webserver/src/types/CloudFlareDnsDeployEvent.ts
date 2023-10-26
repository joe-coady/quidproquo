export enum CloudFlareDnsDeployEventEnum {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
}

export interface CloudFlareDnsEntry {
  value: string;
  type: 'CNAME' | 'A';
  proxied: boolean;
}

export interface CloudFlareDnsEntries {
  [Key: string]: CloudFlareDnsEntry;
}

export interface CloudFlareDnsDeployEventCommon {
  siteDns: string;
  dnsEntries: CloudFlareDnsEntries;
  apiSecretName: string;
}
export interface CloudFlareDnsDeployEventCreate extends CloudFlareDnsDeployEventCommon {
  RequestType: CloudFlareDnsDeployEventEnum.Create;
}

export interface CloudFlareDnsDeployEventUpdate extends CloudFlareDnsDeployEventCommon {
  RequestType: CloudFlareDnsDeployEventEnum.Update;
  oldDnsEntries: CloudFlareDnsEntries;
}

export interface CloudFlareDnsDeployEventDelete extends CloudFlareDnsDeployEventCommon {
  RequestType: CloudFlareDnsDeployEventEnum.Delete;
}

export type CloudFlareDnsDeployEvent =
  | CloudFlareDnsDeployEventCreate
  | CloudFlareDnsDeployEventUpdate
  | CloudFlareDnsDeployEventDelete;

export type CloudFlareDnsDeployEventResponse = void;
