import {
  askConfigGetApplicationInfo,
  askConfigGetParameter,
  askConfigListParameters,
  askMapParallelBatch,
  AskResponse,
  askRunParallel,
  QueueEventResponse,
} from 'quidproquo-core';
import {
  AdminSettingDataType,
  AdminSettingFieldType,
  askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend,
  askWebsocketReadConnectionInfo,
  WebSocketQueueQpqAdminConfigSyncRequestQueueEvent,
  WebSocketQueueQpqAdminServerEventMessageModifySetting,
  WebSocketQueueQpqAdminServerMessageEventType,
} from 'quidproquo-webserver';

export function* onConfigSyncRequest(event: WebSocketQueueQpqAdminConfigSyncRequestQueueEvent): AskResponse<QueueEventResponse> {
  const [params, { connectionId, correlationId }, { module }] = yield* askRunParallel([
    askConfigListParameters(),
    askWebsocketReadConnectionInfo(),
    askConfigGetApplicationInfo(),
  ]);

  yield* askMapParallelBatch(params, 5, function* askSendMessageToFrontend(param: string) {
    const value = yield* askConfigGetParameter(param);

    const logMessage: WebSocketQueueQpqAdminServerEventMessageModifySetting = {
      type: WebSocketQueueQpqAdminServerMessageEventType.ModifySetting,
      payload: {
        fieldType: AdminSettingFieldType.TextBox,
        dataType: AdminSettingDataType.Parameter,
        label: `${param}`,
        tooltip: `Parameter ${param}`,
        value: value,
        service: module,
      },
    };

    yield* askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend(
      {
        ...logMessage,
        correlationId,
      },
      connectionId,
    );
  });

  return true;
}
