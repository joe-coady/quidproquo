import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { askEventDocStoreProvide, buildEventDocStore } from '../../eventDoc/context';
import { EventDocDocRef, EventDocTransferRegistry } from '../models';
import { findEventDocTransferCollection } from './findEventDocTransferCollection';

/**
 * Run `story` with the referenced collection's store provided, so every generic `askEventDoc*`
 * data function inside it targets that collection. This is the whole reason the transfer needs no
 * HTTP between collections: they live in this service, so the store is a context provide, not a
 * network hop. An unregistered or cross-service reference throws rather than being skipped, so an
 * incomplete manifest can never masquerade as a complete export.
 */
export function* askEventDocTransferProvideCollection<T>(
  registry: EventDocTransferRegistry,
  ref: EventDocDocRef,
  story: AskResponse<T>,
): AskResponse<T> {
  const collection = findEventDocTransferCollection(registry, ref);

  if (!collection) {
    return yield* askThrowError(
      ErrorTypeEnum.BadRequest,
      `No registered event doc collection for ${ref.service}/${ref.type}. Transfers only span collections registered with defineEventDocTransfer in service '${registry.service}'.`,
    );
  }

  return yield* askEventDocStoreProvide(buildEventDocStore(collection), story);
}
