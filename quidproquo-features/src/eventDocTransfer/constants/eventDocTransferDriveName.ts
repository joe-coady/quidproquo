// The blob drive bundles are staged on, both directions (exports written for download,
// uploads read back for import). One per service, and the deploy namespaces it by
// application/service/environment, so a fixed name cannot collide. Deliberately NOT a
// collection's drive: a bundle spans collections and is disposable.
export const EVENT_DOC_TRANSFER_DRIVE_NAME = 'edoctransfer';
