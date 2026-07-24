import { RouteAuthSettings } from 'quidproquo-webserver';

import { EventDocRouteName } from './EventDocRouteName';

export type EventDocRoutesOptions = {
  /** Must match a `defineEventDocSummary` in the same service. */
  storeName: string;
  type: string;
  /**
   * The collection root, named after the model `type` like every other collection
   * (`template` -> `/templates`, `style` -> `/styles`). Nothing else may mount a
   * literal under it: `${basePath}/{id}` matches any single segment, so a sibling
   * `${basePath}/thing` route is ambiguous with the id `'thing'`.
   */
  basePath: `/${string}`;
  // Routes to leave unmounted, for a collection that must own one itself (e.g. the
  // tenant registry owns create, so creating also links the caller as first member;
  // the stock create would silently make an unreachable doc). Everything else the
  // collection needs the stock behaviour for still mounts.
  excludeRoutes?: EventDocRouteName[];
  // Omit to leave routes open — mutations then have no user to attribute.
  routeAuthSettings?: RouteAuthSettings;
  version?: number;
  // Registered inline-function name (see `defineInlineFunction`). When set, every append
  // invokes it with `{ event, events }` to reject lifecycle/payload-invalid events before
  // they reach the log. The frontend editor runs the same rule for instant feedback.
  eventValidator?: string;
  // Registered inline-function name (see `defineInlineFunction`). When set, a
  // `GET {basePath}/{id}/render` route is mounted; it invokes the renderer with the doc's
  // full `{ events }` log, which folds + renders to HTML (e.g. `foldLayout(events).html`).
  eventRenderer?: string;
  // Registered inline-function name (see `defineInlineFunction`). When set, every successful
  // append of a Publish event invokes it with `{ docId, event, summary }` after the event is
  // durably written and the summary re-derived - the seam for syncing a folded document into
  // a materialized read model. Errors propagate to the caller: the event has landed, but the
  // side effect did not, so the caller learns the read model may be stale.
  onPublish?: string;
  // Registered inline-function name (see `defineInlineFunction`). When set, EVERY successful
  // append (domain events and lifecycle events alike) invokes it with
  // `{ docId, event, summary, events }` after the event is durably written and the summary
  // re-derived - the seam for reacting to any mutation (e.g. broadcasting the doc's fresh
  // fold). Runs after `onPublish` when both fire on the same Publish event. Errors propagate
  // to the caller: the event has landed, but the side effect did not.
  onAppend?: string;
  // Registered inline-function name (see `defineInlineFunction`). When set, every route
  // invokes it with `{ event }` before running; a non-null result becomes the ambient
  // storage scope for the whole request, transparently partitioning the collection's
  // stores and assets (e.g. per-tenant via the tenant feature's TENANT_SCOPE_RESOLVER_FN).
  // Null means unscoped. Omit for collections that never partition.
  scopeResolver?: string;
};
