import { EventActionType, QPQConfig, actionResult, qpqCoreUtils, EventGetRecordsActionProcessor } from 'quidproquo-core';

import { StorageDriveEventType } from 'quidproquo-webserver';

import { EventInput, GLOBAL_STORAGE_DRIVE_NAME, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [s3Event, context] }) => {
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

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
  };
};
