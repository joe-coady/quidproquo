import { StreamChunk, StreamRegistry } from '../../types/StreamRegistry';

interface StreamEntry {
  iterator: AsyncIterableIterator<string>;
  nextPromise: Promise<IteratorResult<string>>;
}

export const createStreamRegistry = (): StreamRegistry => {
  const streams = new Map<string, StreamEntry>();

  return {
    register(id: string, iterator: AsyncIterableIterator<string>): void {
      if (streams.has(id)) {
        throw new Error(`Stream already registered: ${id}`);
      }

      streams.set(id, {
        iterator,
        nextPromise: iterator.next(),
      });
    },

    async read(id: string, noWait?: boolean): Promise<StreamChunk<string>> {
      const entry = streams.get(id);
      if (!entry) {
        throw new Error(`Stream not found: ${id}`);
      }

      if (noWait) {
        const result = await Promise.race([
          entry.nextPromise.then((r) => ({ resolved: true as const, result: r })),
          Promise.resolve({ resolved: false as const }),
        ]);

        if (!result.resolved) {
          return { done: false, skipped: true };
        }

        const iterResult = result.result;
        if (iterResult.done) {
          streams.delete(id);
          return { done: true };
        }

        entry.nextPromise = entry.iterator.next();
        return { done: false, data: iterResult.value };
      }

      const iterResult = await entry.nextPromise;
      if (iterResult.done) {
        streams.delete(id);
        return { done: true };
      }

      entry.nextPromise = entry.iterator.next();
      return { done: false, data: iterResult.value };
    },

    close(id: string): void {
      const entry = streams.get(id);
      if (entry) {
        entry.iterator.return?.();
        streams.delete(id);
      }
    },

    has(id: string): boolean {
      return streams.has(id);
    },
  };
};
