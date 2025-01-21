import { QPQConfig, qpqCoreUtils, QpqFunctionRuntime, QpqRuntimeType } from 'quidproquo-core';
import { qpqWebServerUtils, WebSocketEventType, WebSocketQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { createServer } from 'http';
import { RawData, WebSocketServer } from 'ws';

import { getWsWebsocketEventEventProcessor } from '../../actionProcessor';
import { processEvent } from '../../logic';
import { DevServerConfig } from '../../types';
import { WsEvent } from './types';

type WebSocketQPQWebServerConfigSettingMap = {
  service: string;
  apiName: string;
  setting: WebSocketQPQWebServerConfigSetting;
  qpqConfig: QPQConfig;
};

type WebSocketQPQWebServerConfigSettingMapWithWebSocketServer = WebSocketQPQWebServerConfigSettingMap & {
  server: WebSocketServer;
};

const getDynamicModuleLoader = (qpqConfig: QPQConfig, devServerConfig: DevServerConfig) => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (runtime: QpqFunctionRuntime): Promise<any> => devServerConfig.dynamicModuleLoader(serviceName, runtime);
};

const startServer = (
  settingsMap: WebSocketQPQWebServerConfigSettingMap,
  devServerConfig: DevServerConfig,
): WebSocketQPQWebServerConfigSettingMapWithWebSocketServer => {
  const webSocketServer = new WebSocketServer({ noServer: true });

  console.log(`WebSocket: ws://${devServerConfig.serverDomain}:${devServerConfig.webSocketPort}/${settingsMap.service}/${settingsMap.apiName}`);

  webSocketServer.on('connection', (ws, req) => {
    const connectionId = req.headers['sec-websocket-key'] || crypto.randomUUID();
    const sourceIp = req.socket.remoteAddress === '::1' || !req.socket.remoteAddress ? '127.0.0.1' : req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown agent';

    const processWsEvent = (wsEvent: WsEvent) =>
      processEvent<WsEvent, void>(
        wsEvent,
        settingsMap.qpqConfig,
        getDynamicModuleLoader(settingsMap.qpqConfig, devServerConfig),
        getWsWebsocketEventEventProcessor,
        QpqRuntimeType.WEBSOCKET_EVENT,
      );

    const onConnectEvent: WsEvent = {
      apiName: settingsMap.apiName,
      service: settingsMap.service,
      eventType: WebSocketEventType.Connect,
      body: undefined,
      messageId: crypto.randomUUID(),
      connectionId: connectionId,
      requestTimeEpoch: Date.now(),
      sourceIp: sourceIp,
      userAgent: userAgent,
    };

    processWsEvent(onConnectEvent);

    ws.on('error', console.error);

    ws.on('message', (data: RawData, isBinary) => {
      console.log('isBinary: ', isBinary);

      const onMessageEvent: WsEvent = {
        apiName: settingsMap.apiName,
        service: settingsMap.service,
        eventType: WebSocketEventType.Message,
        body: data,
        messageId: crypto.randomUUID(),
        connectionId: connectionId,
        requestTimeEpoch: Date.now(),
        sourceIp: sourceIp,
        userAgent: userAgent,
      };

      processWsEvent(onMessageEvent);
    });

    ws.on('close', () => {
      const onCloseEvent: WsEvent = {
        apiName: settingsMap.apiName,
        service: settingsMap.service,
        eventType: WebSocketEventType.Disconnect,
        body: undefined,
        messageId: crypto.randomUUID(),
        connectionId: connectionId,
        requestTimeEpoch: Date.now(),
        sourceIp: sourceIp,
        userAgent: userAgent,
      };

      processWsEvent(onCloseEvent);
    });
  });

  return {
    ...settingsMap,

    server: webSocketServer,
  };
};

const getWebSocketQPQWebServerConfigSettingMaps = (qpqConfigs: QPQConfig[]): WebSocketQPQWebServerConfigSettingMap[] => {
  return qpqConfigs
    .flatMap((qpqConfig) => {
      const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
      return qpqWebServerUtils.getWebsocketSettings(qpqConfig).flatMap((wsc) => {
        const item: WebSocketQPQWebServerConfigSettingMap = {
          apiName: wsc.apiName,
          service,
          setting: wsc,
          qpqConfig,
        };

        return item;
      });
    })
    .filter(
      (item, index, arr) => arr[index].apiName !== item.apiName || !item.setting.owner?.module || arr[index].service === item.setting.owner?.module,
    );
};

export const webSocketImplementation = async (devServerConfig: DevServerConfig) => {
  if (!devServerConfig.webSocketPort) {
    return;
  }

  const webSocketQPQWebServerConfigSettingMaps = getWebSocketQPQWebServerConfigSettingMaps(devServerConfig.qpqConfigs);

  const server = createServer();

  const allServers = webSocketQPQWebServerConfigSettingMaps.map((x) => startServer(x, devServerConfig));

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url || '', 'wss://base.url');

    const serverInfo = allServers.find((s) => pathname === `/${s.service}/${s.apiName}`);

    if (serverInfo) {
      serverInfo.server.handleUpgrade(request, socket, head, (ws) => {
        serverInfo.server.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(devServerConfig.webSocketPort, 'localhost');

  // Never ends
  await new Promise(() => {});
};
