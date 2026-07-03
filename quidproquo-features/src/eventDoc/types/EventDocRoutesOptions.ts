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
};
