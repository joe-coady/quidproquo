// Which event-doc collection + document a slot is bound to at runtime. Event routes
// live at `/v1{basePath}/{id}/events` on `serviceName`, so one generic workspace can
// drive any event-doc collection.
export type EventDocWorkspaceDocumentIdentity = {
  serviceName: string;
  basePath: string;
  id: string;
};
