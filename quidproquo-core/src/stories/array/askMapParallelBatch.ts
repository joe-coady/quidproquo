import { askDelay } from '../../actions';
import { AskResponse } from '../../types';
import { askMapParallel } from './askMapParallel';

export function* askMapParallelBatch<T, R>(
  items: T[],
  numBatch: number,
  askCallback: (item: T, index: number, srcArray: T[]) => AskResponse<R>,
  delayAfterEachBatchMs = 0,
): AskResponse<R[]> {
  // Copy the items array to avoid modifying the original array
  let itemsToBatch = [...items];

  // Prepare an array to collect all results
  let allResults: R[] = [];

  // Continue creating batches until itemsToBatch is empty
  while (itemsToBatch.length > 0) {
    // Remove the first numBatch items from itemsToBatch to create a batch
    const batch = itemsToBatch.splice(0, numBatch);

    // Process the current batch using askMapParallel and collect results
    const batchResults: R[] = yield* askMapParallel<T, R>(batch, askCallback);
    allResults = allResults.concat(batchResults);

    // If there is a delay after each batch, wait for the delay
    if (delayAfterEachBatchMs > 0) {
      // Wait for a delay after each batch
      yield* askDelay(delayAfterEachBatchMs);
    }
  }

  return allResults;
}
