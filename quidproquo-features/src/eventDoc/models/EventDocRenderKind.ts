// What an EventDoc render produced. The kind depends on the doc type's renderer: layout +
// content render to html, a stylesheet to css, a template to a generated blob (a pdf). Only
// Html is produced today; Css/Blob are modelled ahead of use.
export enum EventDocRenderKind {
  Html = 'html',
  Css = 'css',
  Blob = 'blob',
}
