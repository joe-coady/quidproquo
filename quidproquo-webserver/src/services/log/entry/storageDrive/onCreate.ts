/* eslint-disable @typescript-eslint/no-unused-vars */
import { StorageDriveEvent } from '../../../../types';

export function* onCreate(event: StorageDriveEvent) {
  console.log("s3 event: ", event);  
}
