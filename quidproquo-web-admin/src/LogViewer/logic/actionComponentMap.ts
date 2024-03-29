import { ActionComponent, getGenericActionRenderer } from '../actionComponents';

export const actionComponentMap: Record<string, ActionComponent> = {
  ['@quidproquo-webserver/Websocket/SendMessage']: getGenericActionRenderer(
    'askWebsocketSendMessage',
    ['websocketApiName', 'connectionId', 'payload'],
  ),
  ['@quidproquo-core/UserDirectory/RefreshToken']: getGenericActionRenderer(
    'askUserDirectoryRefreshToken',
    ['userDirectoryName', 'refreshToken'],
  ),
  ['@quidproquo-core/UserDirectory/DecodeAccessToken']: getGenericActionRenderer(
    'askUserDirectoryDecodeAccessToken',
    ['userDirectoryName', 'ignoreExpiration', 'accessToken', 'serviceOverride'],
  ),
  ['@quidproquo-core/KeyValueStore/Query']: getGenericActionRenderer(
    'askKeyValueStoreQuery',
    ['keyValueStoreName', 'keyCondition', 'options'],
    [
      'keyValueStoreName: string',
      'keyCondition: KvsQueryOperation',
      'options?: KeyValueStoreQueryOptions',
    ],
  ),
  ['@quidproquo-core/KeyValueStore/Upsert']: getGenericActionRenderer(
    'askKeyValueStoreUpsert',
    ['keyValueStoreName', 'item', 'options'],
    ['keyValueStoreName: string', 'item: KvsItem', 'options?: KeyValueStoreUpsertOptions'],
  ),
  ['@quidproquo-webserver/ServiceFunction/Execute']: getGenericActionRenderer(
    'askServiceFunctionExecute',
    ['service', 'functionName', 'payload', 'isAsync'],
  ),
  ['@quidproquo-core/Context/Read']: getGenericActionRenderer('askContextRead', [
    'contextIdentifier',
  ]),
};
