import { RouteAuthSettings } from 'quidproquo-webserver';

export type EventDocRoutesOptions = {
  /** Must match a `defineEventDocSummary` in the same service. */
  storeName: string;
  type: string;
  basePath: `/${string}`;
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
  // Registered inline-function name (see `defineInlineFunction`). When set, every route
  // invokes it with `{ event }` before running; a non-null result becomes the ambient
  // storage scope for the whole request, transparently partitioning the collection's
  // stores and assets (e.g. per-tenant via the tenant feature's TENANT_SCOPE_RESOLVER_FN).
  // Null means unscoped. Omit for collections that never partition.
  scopeResolver?: string;
};
