import { AnyEventMessage, EventMessage } from 'quidproquo-core';

// Private / internal types
type WebSocketEventListenerFunction = (this: WebSocket, ev: Event) => any;

export enum WebsocketServiceEvent {
  OPEN = 'open',
  CLOSE = 'close',
  MESSAGE = 'message',
  ERROR = 'error',
}

export type SubscriptionHandle = {
  type: WebsocketServiceEvent;
};

export type WebSocketServiceSubscriptionFunction = (websocketService: WebsocketService, event?: Event) => any;

type SubscriptionMap = Map<SubscriptionHandle, WebSocketServiceSubscriptionFunction>;

type Subscriptions = {
  [key in WebsocketServiceEvent]: SubscriptionMap;
};

type WebsocketSendPayload = string | ArrayBufferLike | Blob | ArrayBufferView;

export type WebSocketServiceEventSubscriptionFunction<E extends AnyEventMessage> = (websocketService: WebsocketService, event: E) => void;

export class WebsocketService {
  public readonly url: string;
  private socket: WebSocket | null = null;
  private eventListeners: { [key: string]: WebSocketEventListenerFunction[] } = {};
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

  public hasBeenDestroyed() {
    return this.isDestroyed;
  }

  public getSocket() {
    return this.socket;
  }

  public subscribe(subscriptionType: WebsocketServiceEvent, callback: WebSocketServiceSubscriptionFunction): SubscriptionHandle {
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
    return this.subscribe(WebsocketServiceEvent.MESSAGE, (websocketService: WebsocketService, event?: Event) => {
      if (event) {
        const data = (event as MessageEvent).data;
        try {
          const parsedEvent: E = JSON.parse(data);
          if (parsedEvent.type === subscriptionType) {
            callback(websocketService, parsedEvent);
          }
        } catch (e) {
          // Must have been some other message format / type do nothing.
        }
      }
    });
  }

  public unsubscribe(subscriptionHandle: SubscriptionHandle) {
    this.subscriptions[subscriptionHandle.type].delete(subscriptionHandle);
  }

  public unsubscribeAll() {
    for (const subscriptionType in this.subscriptions) {
      if (Object.prototype.hasOwnProperty.call(this.subscriptions, subscriptionType)) {
        this.subscriptions[subscriptionType as WebsocketServiceEvent].clear();
      }
    }
  }

  private connect() {
    this.removeAllEventListeners();

    this.socket = new WebSocket(this.url);

    this.addEventListener(WebsocketServiceEvent.OPEN, this.onConnect.bind(this));
    this.addEventListener(WebsocketServiceEvent.CLOSE, this.onClose.bind(this));
    this.addEventListener(WebsocketServiceEvent.MESSAGE, this.onMessage.bind(this));
    this.addEventListener(WebsocketServiceEvent.ERROR, this.onError.bind(this));
  }

  private addEventListener(event: WebsocketServiceEvent, listener: WebSocketEventListenerFunction) {
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
        if (Object.prototype.hasOwnProperty.call(this.eventListeners, event)) {
          for (const listener of this.eventListeners[event]) {
            this.socket.removeEventListener(event, listener);
          }
        }
      }
    }

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
    this.notifySubscribers(WebsocketServiceEvent.OPEN);
    const messages = this.pendingMessages;
    this.pendingMessages = [];
    messages.forEach((message) => {
      this.send(message);
    });
  }

  private onClose() {
    this.removeAllEventListeners();
    this.reconnectIfNotDestroyed();
    this.notifySubscribers(WebsocketServiceEvent.CLOSE);
  }

  private onMessage(event: Event) {
    this.notifySubscribers(WebsocketServiceEvent.MESSAGE, event);
  }

  private onError(event: Event) {
    this.notifySubscribers(WebsocketServiceEvent.ERROR, event);
  }

  private notifySubscribers(subType: WebsocketServiceEvent, event?: Event) {
    this.subscriptions[subType].forEach((callback) => {
      callback(this, event);
    });
  }

  public send(data: WebsocketSendPayload) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      this.pendingMessages.push(data);
    }
  }

  public sendEvent<E extends EventMessage<any, string | number>>(event: E) {
    this.send(JSON.stringify(event));
  }
}
