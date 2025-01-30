import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetRecordsActionProcessor,
  NotifyErrorQueueErrorQueueEvent,
  NotifyErrorQueueEvents,
  NotifyErrorQueueTimeoutQueueEvent,
  QPQConfig,
} from 'quidproquo-core';

import { AnyQueueMessageWithSession, CloudWatchAlarmNotification, EventInput, InternalEventRecord } from './types';

export function isCloudWatchAlarmNotification(obj: any): obj is CloudWatchAlarmNotification {
  return typeof obj === 'object' && !!obj.AlarmName && !!obj.Trigger;
}

export function isErrorsCloudWatchAlarmNotification(cwn: CloudWatchAlarmNotification): boolean {
  return cwn.Trigger.MetricName === 'Errors' && cwn.Trigger.Namespace === 'AWS/Lambda';
}

export function isTimeoutCloudWatchAlarmNotification(cwn: CloudWatchAlarmNotification): boolean {
  return cwn.Trigger.MetricName === 'Timeout' && cwn.Trigger.Namespace === 'AWS/Lambda';
}

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [sqsEvent, context] }) => {
    const records = sqsEvent.Records.map((record) => {
      const parsedInternalEventRecord = JSON.parse(record.body) as AnyQueueMessageWithSession;

      if (isCloudWatchAlarmNotification(parsedInternalEventRecord)) {
        if (isErrorsCloudWatchAlarmNotification(parsedInternalEventRecord)) {
          const queueEvent: NotifyErrorQueueErrorQueueEvent = {
            id: record.messageId,
            message: {
              type: NotifyErrorQueueEvents.Error,
              payload: {
                newStateReason: parsedInternalEventRecord.NewStateReason,
                newStateInAlarm: parsedInternalEventRecord.NewStateValue === 'ALARM',
                oldStateInAlarm: parsedInternalEventRecord.OldStateValue === 'ALARM',
              },
            },
          };

          return queueEvent;
        } else if (isTimeoutCloudWatchAlarmNotification(parsedInternalEventRecord)) {
          const queueEvent: NotifyErrorQueueTimeoutQueueEvent = {
            id: record.messageId,
            message: {
              type: NotifyErrorQueueEvents.Timeout,
              payload: {
                newStateReason: parsedInternalEventRecord.NewStateReason,
                newStateInAlarm: parsedInternalEventRecord.NewStateValue === 'ALARM',
                oldStateInAlarm: parsedInternalEventRecord.OldStateValue === 'ALARM',
              },
            },
          };

          return queueEvent;
        }

        const queueEvent: InternalEventRecord = {
          id: record.messageId,
          message: {
            type: NotifyErrorQueueEvents.Unknown,
            payload: {},
          },
        };

        return queueEvent;
      }

      // TODO: Remove the session from this object
      //       note: we still need to access the session in the story execution for depth and auth etc.
      const internalEventRecord: InternalEventRecord = {
        message: {
          type: parsedInternalEventRecord.type,
          payload: parsedInternalEventRecord.payload,
        },
        id: record.messageId,
      };

      return internalEventRecord;
    });

    return actionResult(records);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
