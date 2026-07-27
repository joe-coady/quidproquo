// AWS SDK client constructors vary in config type and optionality (some take an optional
// config); `any` here is the variance boundary that lets one helper accept them all.
type AnyClientConstructor = new (args: any) => unknown;

type CachedClient = {
  send?: (...sendArgs: unknown[]) => Promise<unknown>;
};

// One client instance per (client class, config) pair, reused across invocations in a
// warm lambda container so connection pools and SDK middleware are not rebuilt per call.
const cache = new WeakMap<AnyClientConstructor, Map<string, unknown>>();

/**
 * Returns a cached AWS SDK v3 client for the given class and config, creating it on first
 * use. The client's `send` is wrapped so failed calls log the client, config, and command
 * before rethrowing (CloudWatch visibility for which AWS call failed and why).
 */
export function createAwsClient<TClient>(ClientClass: new (args: any) => TClient, args: object): TClient {
  let argsCache = cache.get(ClientClass);
  if (!argsCache) {
    argsCache = new Map();
    cache.set(ClientClass, argsCache);
  }

  const argsKey = JSON.stringify(args);

  if (!argsCache.has(argsKey)) {
    const newClient = new ClientClass(args) as CachedClient;

    if (typeof newClient.send === 'function') {
      const originalSend = newClient.send;
      newClient.send = async function (...sendArgs: unknown[]) {
        try {
          return await originalSend.apply(this, sendArgs);
        } catch (error) {
          console.log(ClientClass.name || 'aws client', args, 'send args', sendArgs, 'error', (error as Error).message);
          throw error;
        }
      };
    }

    argsCache.set(argsKey, newClient);
  }

  return argsCache.get(argsKey) as TClient;
}
