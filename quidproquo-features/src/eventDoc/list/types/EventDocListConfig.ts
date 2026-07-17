// Supplied by the host view when it initialises a list instance (doccypoccy builds
// this from the tab's module params). The edit* fields are opaque routing strings the
// list only stores; the host's open-item story reads them back to route to its editor.
export type EventDocListConfig = {
  serviceName: string;
  basePath: string;
  editService: string;
  editModule: string;
  // labels the editor as `{entityLabel} - {name}`
  entityLabel: string;
  // Base path the editor is opened against, when the collection's doc CRUD
  // lives somewhere other than the create route (e.g. tenants create at
  // /my-tenants, doc CRUD at /tenants). Empty means: use basePath.
  editBasePath: string;
  // Base path the summary list is fetched from, when it differs from the
  // create route (e.g. tenants create at /my-tenants, scoped list at
  // /tenants). Empty means: use basePath.
  listBasePath: string;
};
