type ClientConstructor<T> = new (args: any) => T;

const cache = new WeakMap<ClientConstructor<any>, Map<string, any>>();

export function createAwsClient<T>(ClientClass: ClientConstructor<T>, args: any): T {
  // Get or create the Map for the ClientClass
  let argsCache = cache.get(ClientClass);
  if (!argsCache) {
    argsCache = new Map();
    cache.set(ClientClass, argsCache);
  }

  // Generate a key for the arguments
  const argsKey = JSON.stringify(args);

  // Check if the instance already exists in the cache
  if (!argsCache.has(argsKey)) {
    const newClient = new ClientClass(args) as { send?: (...args: any[]) => any };

    // If the send method exists, wrap it with error handling so we can see it in the logs
    if (typeof newClient.send === 'function') {
      const originalSend = newClient.send;
      newClient.send = async function (...sendArgs: any[]) {
        try {
          return await originalSend.apply(this, sendArgs);
        } catch (error: any) {
          console.log(ClientClass.name || 'aws client', args, 'send args', sendArgs, 'error', error.message);
          throw error;
        }
      };
    }

    // Create a new instance and store it in the cache
    argsCache.set(argsKey, newClient);
  }

  // Return the cached instance
  return argsCache.get(argsKey)!;
}
