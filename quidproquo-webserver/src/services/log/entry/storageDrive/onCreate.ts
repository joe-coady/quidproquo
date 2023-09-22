/* eslint-disable @typescript-eslint/no-unused-vars */
import { StorageDriveEvent } from '../../../../types';
import { askUpdateDatabaseFromLogFiles } from '../logic/askUpdateDatabaseFromLogFiles';

export function* onCreate(event: StorageDriveEvent) {
  yield* askUpdateDatabaseFromLogFiles(event.driveName, event.filePaths);
}
