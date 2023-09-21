
export enum StorageDriveEventType {
  Create = 'Create',
  Delete = 'Delete'
}

export type StorageDriveEvent = {
  eventType: StorageDriveEventType;
  driveName: string;

  filePaths: string[];
}

export type StorageDriveEventResponse = void;
