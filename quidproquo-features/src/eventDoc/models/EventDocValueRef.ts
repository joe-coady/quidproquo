import { EventDocAssetRef } from './EventDocAssetRef';

/**
 * A recorded VALUE in an event: either carried inline, or pointed at on the collection's blob drive.
 *
 * Distinct from {@link EventDocAssetRef}, which addresses a genuine FILE (an uploaded font, an image, a
 * rendered PDF). A value ref addresses a piece of DATA whose size is not known in advance — a node's
 * output pin, a variable, a trigger input — where the right storage depends entirely on how big it turns
 * out to be.
 *
 * WHY THE UNION EXISTS. A by-ref-always policy is correct for large payloads: an event is one KVS record,
 * so embedding a 200KB HTTP response body would breach DynamoDB's 400KB item ceiling. But applied
 * uniformly it inverts the economics for small values. Measured on a real DocGen environment: 52,565
 * snapshot objects totalling 684KB — median 5 BYTES, 96% at or under 32 bytes, holding things like `true`
 * and `"MARGINAL_SERVICEABILITY"`. Each cost two blob objects (the value plus its mimetype sidecar) and,
 * on read, two HTTP round trips (presign, then download) to fetch five bytes. One Test Centre page render
 * issued over 1,600 requests to reassemble about 10KB of data. The reference was bigger than the referent.
 *
 * So: inline what is small, reference what is not. The discriminant is explicit rather than inferred from
 * the presence of `guid`, so a reader cannot mistake one for the other, and a future kind can be added
 * without ambiguity.
 */
export type EventDocValueRef =
  | {
      kind: 'inline';
      /** The value itself, as it will be JSON-serialised into the event. */
      value: unknown;
    }
  | ({
      kind: 'asset';
    } & EventDocAssetRef);
