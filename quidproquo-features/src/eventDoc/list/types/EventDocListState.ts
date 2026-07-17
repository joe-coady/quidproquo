import { Nullable } from 'quidproquo-core';

import { EventDocSummary } from '../../models';
import { EVENT_DOC_LIST_PAGE_SIZE } from '../constants/eventDocListPageSize';
import { EventDocListConfig } from './EventDocListConfig';

export type EventDocListState = EventDocListConfig & {
  items: EventDocSummary[];
  isLoading: boolean;
  error: Nullable<string>;
  page: number;
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
  items: [],
  isLoading: false,
  error: null,
  page: 1,
  pageSize: EVENT_DOC_LIST_PAGE_SIZE,
});
