import NodeCache from 'node-cache';

const cache = new WeakMap<object, NodeCache>();

/**
 * Memoizes a function by caching its return values.
 * @param func The function to memoize.
 * @param ttlInSeconds Time-to-live for the cached values in seconds.
 * @returns The memoized function.
 */
export const memoFunc = <T extends (...args: any[]) => any>(
  func: T,
  ttlInSeconds: number = 3600,
): T => {
  return ((...args: any[]) => {
    // Check if the function has a corresponding cache entry
    if (!cache.has(func)) {
      // Create a new NodeCache instance and store it in the cache
      cache.set(func, new NodeCache({ stdTTL: ttlInSeconds }));
    }

    const cacheKey = JSON.stringify(args);
    const nodeCache = cache.get(func)!;
    const cachedValue = nodeCache.get<T>(cacheKey);

    if (cachedValue) {
      return cachedValue;
    }

    // Call the original function if the value is not cached
    const result = func(...args);

    // Cache the result for future use
    nodeCache.set(cacheKey, result);

    return result;
  }) as T;
};
