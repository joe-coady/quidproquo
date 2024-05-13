import { AnyEventMessage, EventMessage } from 'quidproquo-core';

// Private / internal types
type WebSocketEventListnerFunction = (this: WebSocket, ev: Event, data?: string) => any;

export enum WebsocketServiceEvent {
  OPEN = 'open',
  CLOSE = 'close',
  MESSAGE = 'message',
  ERROR = 'error',
}

export type SubscriptionHandle = {
  type: WebsocketServiceEvent;
};

type SubscriptionMap = Map<SubscriptionHandle, WebSocketServiceSubscriptionFunction>;

type Subscriptions = {
  [key in WebsocketServiceEvent]: SubscriptionMap;
};

type WebsocketSendPayload = string | ArrayBufferLike | Blob | ArrayBufferView;

export type WebSocketServiceSubscriptionFunction = (
  websocketService: WebsocketService,
  data?: string,
) => any;

export type WebSocketServiceEventSubscriptionFunction<E extends AnyEventMessage> = (
  websocketService: WebsocketService,
  event: E,
) => void;

export class WebsocketService {
  private url: string;
  private socket: WebSocket | null = null;
  private eventListeners: { [key: string]: WebSocketEventListnerFunction[] } = {};
  private isDestroyed: boolean = false;
  private pendingMessages: WebsocketSendPayload[] = [];
  private subscriptions: Subscriptions = {
    [WebsocketServiceEvent.OPEN]: new Map(),
    [WebsocketServiceEvent.CLOSE]: new Map(),
    [WebsocketServiceEvent.MESSAGE]: new Map(),
    [WebsocketServiceEvent.ERROR]: new Map(),
  };

  constructor(url: string) {
    this.url = url;

    this.connect();
  }

  public destroy() {
    this.isDestroyed = true;
    this.unsubscribeAll();
    this.socket?.close();
  }

  public close() {
    this.socket?.close();
  }

  public isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public subscribe(
    subscriptionType: WebsocketServiceEvent,
    callback: WebSocketServiceSubscriptionFunction,
  ): SubscriptionHandle {
    const subscriptionHandle: SubscriptionHandle = {
      type: subscriptionType,
    };
    this.subscriptions[subscriptionType].set(subscriptionHandle, callback);

    return subscriptionHandle;
  }

  public subscribeToEvent<E extends AnyEventMessage>(
    subscriptionType: E['type'],
    callback: WebSocketServiceEventSubscriptionFunction<E>,
  ): SubscriptionHandle {
    return this.subscribe(
      WebsocketServiceEvent.MESSAGE,
      (websocketService: WebsocketService, data?: string) => {
        if (data) {
          try {
            const event: E = JSON.parse(data);
            if (event.type === subscriptionType) {
              callback(websocketService, event);
            }
          } catch (e) {
            // Must of been some other message format / type
          }
        }
      },
    );
  }

  public unsubscribe(subscriptionHandle: SubscriptionHandle) {
    return this.subscriptions[subscriptionHandle.type].delete(subscriptionHandle);
  }

  public unsubscribeAll() {
    for (const subscriptionType in this.subscriptions) {
      if (this.subscriptions.hasOwnProperty(subscriptionType)) {
        this.subscriptions[subscriptionType as WebsocketServiceEvent].clear();
      }
    }
  }

  private connect() {
    this.removeAllEventListeners();

    this.socket = new WebSocket(this.url);

    this.addEventListener('open', this.onConnect.bind(this));
    this.addEventListener('close', this.onClose.bind(this));
    this.addEventListener('message', this.onMessage.bind(this));
    this.addEventListener('error', this.onError.bind(this));
  }

  private addEventListener(event: string, listener: WebSocketEventListnerFunction) {
    if (this.socket) {
      this.socket.addEventListener(event, listener);

      if (!this.eventListeners[event]) {
        this.eventListeners[event] = [];
      }

      this.eventListeners[event].push(listener);
    }
  }

  private removeAllEventListeners() {
    if (this.socket) {
      for (const event in this.eventListeners) {
        if (this.eventListeners.hasOwnProperty(event)) {
          for (const listener of this.eventListeners[event]) {
            this.socket.removeEventListener(event, listener);
          }
        }
      }
    }

    // Clear the eventListeners object
    this.eventListeners = {};
  }

  private reconnectIfNotDestroyed() {
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect();
      }
    }, 1000);
  }

  private onConnect() {
    this.notifySubscribers(this.subscriptions.open);

    // Send any pending messages once we are connected
    const messages = this.pendingMessages;
    this.pendingMessages = [];
    messages.forEach((message) => {
      this.send(message);
    });
  }

  private onClose() {
    this.removeAllEventListeners();
    this.reconnectIfNotDestroyed();

    this.notifySubscribers(this.subscriptions.close);
  }

  private onMessage(event: Event) {
    this.notifySubscribers(this.subscriptions.message, (event as MessageEvent).data);
  }

  private onError() {
    this.notifySubscribers(this.subscriptions.error);
  }

  private notifySubscribers(subscibers: SubscriptionMap, data?: string) {
    subscibers.forEach((callback: WebSocketServiceSubscriptionFunction) => {
      callback(this, data);
    });
  }

  public send(data: WebsocketSendPayload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      this.pendingMessages.push(data);
    }
  }

  public sendEvent<E extends EventMessage<any, string | number>>(event: E) {
    this.send(JSON.stringify(event));
  }
}
