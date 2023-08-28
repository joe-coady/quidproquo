import NodeCache from 'node-cache';

const cache = new WeakMap<object, NodeCache>();

/**
 * Memoizes a function by caching its return values.
 * @param func The function to memoize.
 * @param ttlInSeconds Time-to-live for the cached values in seconds.
 * @returns The memoized function.
 */
export const memoFuncAsync = <T extends (...args: any[]) => any>(
  func: T,
  ttlInSeconds: number = 3600,
): T => {
  return (async (...args: any[]) => {
    if (!cache.has(func)) {
      cache.set(func, new NodeCache({ stdTTL: ttlInSeconds }));
    }

    const cacheKey = JSON.stringify(args);
    const nodeCache = cache.get(func)!;
    const cachedValue = nodeCache.get<T>(cacheKey);

    if (cachedValue !== undefined) {
      return cachedValue;
    }

    try {
      // Await the result and then cache it
      const result = await func(...args);
      nodeCache.set(cacheKey, result);
      return result;
    } catch (err) {
      // If an error occurs, cache the error
      nodeCache.set(cacheKey, err);
      throw err; // re-throw the error to be caught by caller
    }
  }) as unknown as T;
};
