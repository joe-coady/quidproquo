import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { eventDocTransferEndpoint } from '../../constants';
import { EventDocDocRef, EventDocManifestItem } from '../../models';

// Everything that would travel with the picked docs (POST /transfer/manifest), merged and deduped
// across all of them. Read-only: it builds no bundle, so the dialog can show the list before the
// operator commits to anything.
export function* askEventDocManifestFetch(serviceName: string, docs: EventDocDocRef[]): AskResponse<EventDocManifestItem[]> {
  const response = yield* askApiRequest<{ docs: EventDocDocRef[] }, EventDocManifestItem[]>(
    serviceName,
    'POST',
    eventDocTransferEndpoint('manifest'),
    {
      body: { docs },
    },
  );

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Failed to resolve references for ${docs.length} document(s) (${response.status})`);
  }

  return response.data;
}
