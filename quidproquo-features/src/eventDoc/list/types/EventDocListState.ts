import { Nullable } from 'quidproquo-core';

import { EventDocSummary } from '../../models';
import { EVENT_DOC_LIST_PAGE_SIZE } from '../constants/eventDocListPageSize';
import { EventDocListConfig } from './EventDocListConfig';

/**
 * A CURSOR-paged list. `items` is the current page only — never the whole collection.
 *
 * It used to hold every summary and slice a page out in the browser, which meant the cost of opening a list
 * grew with the collection: the server read the entire partition, sorted it in memory and sent all of it, so
 * a few hundred flow runs put a few hundred summaries on the wire to render ten rows.
 *
 * Paging is by CURSOR because that is what the store offers. DynamoDB hands back an opaque key for "carry on
 * from here", not an offset, so pages are walked rather than addressed — there is no jumping to page 7, and
 * no total count without reading everything (which is the thing being avoided). Hence next/previous rather
 * than numbered pages.
 */
export type EventDocListState = EventDocListConfig & {
  items: EventDocSummary[];
  isLoading: boolean;
  error: Nullable<string>;
  // 0-based position in the walk. Display only — it addresses nothing.
  pageIndex: number;
  // The cursor that LOADS each page: cursors[i] is passed to fetch page i, and cursors[0] is always null
  // (the first page needs no cursor). Kept so Previous can re-fetch a page it has already walked past;
  // without it, back would be impossible, since a cursor only ever points forward.
  cursors: Nullable<string>[];
  // The cursor for the page AFTER the current one; null means this is the last page.
  //
  // THE ONLY correct "is there more" signal. Do not infer it from `items.length < pageSize`: soft-deleted
  // documents are removed by a query filter that DynamoDB applies after reading, so a page can legitimately
  // come back short while more pages remain, and counting rows would stop the walk early and hide documents.
  nextPageKey: Nullable<string>;
  pageSize: number;
};

export const createInitialEventDocListState = (): EventDocListState => ({
  serviceName: '',
  basePath: '',
  editService: '',
  editModule: '',
  entityLabel: '',
  editBasePath: '',
  listBasePath: '',
  canTransfer: false,
  items: [],
  isLoading: false,
  error: null,
  pageIndex: 0,
  cursors: [null],
  nextPageKey: null,
  pageSize: EVENT_DOC_LIST_PAGE_SIZE,
});
