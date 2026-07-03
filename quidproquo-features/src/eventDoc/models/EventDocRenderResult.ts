import { EventDocRenderKind } from './EventDocRenderKind';

// The output of rendering an EventDoc — a discriminated union over the render kind, since doc
// types render to different things: html (layout/content), css (stylesheet), or a generated
// blob like a pdf (template). Only the Html variant is produced today; Css/Blob are modelled
// ahead of use (the Blob payload — guid, download mechanism — will firm up when built).
export type EventDocRenderResult =
  | { kind: EventDocRenderKind.Html; html: string }
  | { kind: EventDocRenderKind.Css; css: string }
  | { kind: EventDocRenderKind.Blob; blobId: string };
