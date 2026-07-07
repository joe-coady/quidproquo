// Per-collection blob bucket, named off the store (+ an event-doc marker) so it can't
// collide with other drives in the account. One drive per collection holds both
// `<docId>/assets/<guid>` (immutable uploaded source assets) and, later,
// `<docId>/runtime/<guid>` (derived, disposable build artifacts).
export const eventDocStorageDriveName = (storeName: string): string => `${storeName}edocs`.toLowerCase();
