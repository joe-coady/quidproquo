import { AskResponse } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocListPage } from '../../data/askEventDocListPage';
import { askEventDocProvideRequestScope } from '../../globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';

function* askEventDocStoreList(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const limit = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'limit');
  const nextPageKey = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'nextPageKey');

  const page = yield* askEventDocListPage({
    limit: limit ? Number(limit) : undefined,
    nextPageKey: nextPageKey || undefined,
  });

  return qpqWebServerUtils.toJsonEventResponse(page);
}

/**
 * GET {basePath} — one PAGE of the collection (newest first, excludes soft-deleted).
 *
 * Returns `QpqPagedData`, matching the events route rather than the bare array this used to return. It used
 * to read the whole partition, sort it in memory and send all of it, leaving the client to slice out ten
 * rows — so the cost of opening a list grew with the collection and a few hundred flow runs made it
 * obvious.
 *
 * `limit` and `nextPageKey` are read the same way listEvents reads them, so both list-shaped routes on this
 * collection page identically.
 */
export function* list(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askEventDocStoreList(event)));
}
