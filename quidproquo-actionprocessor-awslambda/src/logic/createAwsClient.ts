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
    // Create a new instance and store it in the cache
    argsCache.set(argsKey, new ClientClass(args));
  }

  // Return the cached instance
  return argsCache.get(argsKey)!;
}


