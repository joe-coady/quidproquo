import { actionResult, askEventGetRecordsBase, createActionProcessor, EventActionType, ProcessorFor, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { StorageDriveEventType } from 'quidproquo-webserver';

import { EventInput, GLOBAL_STORAGE_DRIVE_NAME, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): ProcessorFor<typeof askEventGetRecordsBase> => {
  return async ({ eventParams }) => {
    // Registered for one event source only, so the base requester's
    // source-agnostic payload is narrowed to this source's types here.
    const [s3Event, context] = eventParams as EventInput;

    const records = s3Event.Records.map((r) => {
      const internalEventRecord: InternalEventRecord = {
        driveName: GLOBAL_STORAGE_DRIVE_NAME,
        // TODO: This only needs to be a single filepath now!
        filePaths: [decodeURIComponent(r.s3.object.key)],
        eventType: r.eventName.startsWith('ObjectCreated') ? StorageDriveEventType.Create : StorageDriveEventType.Delete,
      };

      return internalEventRecord;
    });

    return actionResult(records);
  };
};

export const getEventGetRecordsActionProcessor = createActionProcessor(askEventGetRecordsBase, getProcessGetRecords);
