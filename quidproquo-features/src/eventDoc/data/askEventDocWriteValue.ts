import { AskResponse } from 'quidproquo-core';

import { EVENT_DOC_VALUE_INLINE_MAX_BYTES } from '../constants/eventDocValueInlineLimits';
import { serializeEventDocValue } from '../logic/serializeEventDocValue';
import { EventDocValueRef } from '../models';
import { askEventDocWriteAsset } from './askEventDocWriteAsset';

/**
 * Record a value for an event: inline when it is small, on the blob drive when it is not.
 *
 * This is the size-aware counterpart to {@link askEventDocWriteAsset}, which should keep being used
 * directly for genuine FILES (uploads, rendered documents) where a ref is always correct. Use this for
 * DATA of unpredictable size — node outputs, variables, trigger inputs.
 *
 * `maxInlineBytes` lets a caller tighten the per-value limit, which is how a caller with a whole record of
 * values keeps their combined inline size within one event's budget: it passes the REMAINING budget, and a
 * value that no longer fits becomes an asset instead. Passing 0 forces an asset, which is a useful escape
 * hatch for a caller that knows the value is large.
 *
 * The serialisation is shared with the read path so the two cannot disagree about what a value's bytes are,
 * and `undefined` is normalised to `null` — JSON.stringify(undefined) returns undefined rather than a
 * string, and buffering that throws, which would turn a node returning an empty body into a failed run
 * during persistence rather than a routed `failed` branch.
 */
export function* askEventDocWriteValue(
  docId: string,
  value: unknown,
  filename: string,
  maxInlineBytes: number = EVENT_DOC_VALUE_INLINE_MAX_BYTES,
): AskResponse<EventDocValueRef> {
  const { json, bytes } = serializeEventDocValue(value);

  if (bytes <= maxInlineBytes) {
    return { kind: 'inline', value: value === undefined ? null : value };
  }

  const asset = yield* askEventDocWriteAsset(docId, {
    base64Data: Buffer.from(json, 'utf8').toString('base64'),
    filename,
    mimetype: 'application/json',
  });

  return { kind: 'asset', ...asset };
}
