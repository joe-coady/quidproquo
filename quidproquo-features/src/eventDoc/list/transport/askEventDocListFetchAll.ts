import { AskResponse } from 'quidproquo-core';

import { EventDocSummary } from '../../models';
import { askEventDocListFetch } from './askEventDocListFetch';

/**
 * Every summary in a collection, by walking all pages.
 *
 * For the callers that genuinely need the WHOLE set — a picker the user chooses from, an export candidate
 * list — rather than a screen showing ten rows.
 *
 * Deliberately explicit. The list route used to return everything by default, so every list screen paid for
 * the whole collection whether it needed it or not; now the default is one page and a caller that wants all
 * of it asks for all of it, at a cost that is visible at the call site. It is still O(collection): use it
 * only where the full set is the point.
 */
export function* askEventDocListFetchAll(serviceName: string, basePath: string): AskResponse<EventDocSummary[]> {
  const items: EventDocSummary[] = [];
  let nextPageKey: string | undefined;

  do {
    const page = yield* askEventDocListFetch(serviceName, basePath, { nextPageKey });
    items.push(...page.items);
    nextPageKey = page.nextPageKey;
  } while (nextPageKey);

  return items;
}
