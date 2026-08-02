import { Effect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceAppendFullHistoryPayload = {
  slotKey: string;
  // One OLDER page: appended after the held newest-first events, with the cursor for
  // the page after it (absent = the log's beginning has been reached).
  events: EventDocEvent[];
  nextPageKey?: string;
};

export type EventDocWorkspaceAppendFullHistoryEffect = Effect<
  EventDocWorkspaceEffect.AppendFullHistory,
  EventDocWorkspaceAppendFullHistoryPayload
>;
