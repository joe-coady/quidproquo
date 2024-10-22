import NodeCache from 'node-cache';

const cache = new WeakMap<object, NodeCache>();

/**
 * Memoizes a function by caching its return values.
 * @param func The function to memoize.
 * @param ttlInSeconds Time-to-live for the cached values in seconds.
 * @returns The memoized function.
 */
export const memoFuncAsync = <T extends (...args: any[]) => any>(func: T, ttlInSeconds: number = 3600): T => {
  return (async (...args: any[]) => {
    if (!cache.has(func)) {
      cache.set(func, new NodeCache({ stdTTL: ttlInSeconds }));
    }

    const cacheKey = JSON.stringify(args);
    const nodeCache = cache.get(func)!;

    if (nodeCache.has(cacheKey)) {
      return nodeCache.get<T>(cacheKey);
    }

    // Await the result
    const result = await func(...args);

    // and then cache it
    nodeCache.set(cacheKey, result);

    return result;
  }) as unknown as T;
};
