import { QpqIsoDateTime } from 'quidproquo-core';

// Where a bundle came from. Provenance only: the import side never routes on it, because both
// environments run the same app and address collections identically. Shown to the operator so
// "which environment is this file from" is answerable without opening the docs.
export type EventDocBundleSource = {
  application: string;
  environment: string;
  exportedAt: QpqIsoDateTime;
};
