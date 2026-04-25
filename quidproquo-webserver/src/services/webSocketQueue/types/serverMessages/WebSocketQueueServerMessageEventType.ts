export enum WebSocketQueueServerMessageEventType {
  Authenticated = 'Qpq/WebSocketQueue/Authenticated',
  Pong = 'Qpq/WebSocketQueue/Pong',
  ServiceRequestResponse = 'Qpq/WebSocketQueue/ServiceRequestResponse',
  StateDispatch = 'Qpq/WebSocketQueue/StateDispatch',
  Unauthenticated = 'Qpq/WebSocketQueue/Unauthenticated',
}
