
// Private / internal types
type WebSocketEventListnerFunction = (this: WebSocket, ev: Event, data?: string) => any;

export enum WebsocketServiceEvent {
    OPEN = "open",
    CLOSE = "close",
    MESSAGE = "message",
    ERROR = "error"
};

export type SubscriptionHandle = {
    type: WebsocketServiceEvent;
}

type SubscriptionMap = Map<SubscriptionHandle, WebSocketServiceSubscriptionFunction>;

type Subscriptions = {
    [key in WebsocketServiceEvent]: SubscriptionMap;
}

export type WebSocketServiceSubscriptionFunction = (websocketService: WebsocketService, data?: string) => any

export class WebsocketService {
    private url: string;
    private socket: WebSocket | null = null;
    private eventListeners: { [key: string]: WebSocketEventListnerFunction[] } = {};
    private isDestroyed: boolean = false;
    private subscriptions: Subscriptions = {
        [WebsocketServiceEvent.OPEN]: new Map(),
        [WebsocketServiceEvent.CLOSE]: new Map(),
        [WebsocketServiceEvent.MESSAGE]: new Map(),
        [WebsocketServiceEvent.ERROR]: new Map()
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

    public subscribe(subscriptionType: WebsocketServiceEvent, callback: WebSocketServiceSubscriptionFunction) {
        const subscriptionHandle: SubscriptionHandle = {
            type: subscriptionType
        };
        this.subscriptions[subscriptionType].set(subscriptionHandle, callback);

        // If we are already open, then call the callback immediately
        if (subscriptionType === WebsocketServiceEvent.OPEN && this.socket?.readyState === WebSocket.OPEN) {
            try {
                callback(this);
            } catch (e) {
                console.error('Error in Websocket onConnect callback: ', e);
            }
        }

        return subscriptionHandle;
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

        this.addEventListener("open", this.onConnect.bind(this));
        this.addEventListener("close", this.onClose.bind(this));
        this.addEventListener("message", this.onMessage.bind(this));
        this.addEventListener("error", this.onError.bind(this));
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
        console.log(`WebSocket connected: ${this.url}`);

        this.notifySubscribers(this.subscriptions.open);
    }

    private onClose() {
        console.log(`Websocket disconnected`);
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
  
    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(data);
      } else {
        console.error(`WebSocket is not open [${this.socket?.readyState}]. Unable to send data.`);
      }
    }
  }
  