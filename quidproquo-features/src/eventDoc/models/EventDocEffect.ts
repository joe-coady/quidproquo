// Reserved event-doc effects shared by every fold reducer (handled by the base
// reducer, declared once here so seeder + reducers can't drift). INIT_STATE opens every
// log (index 0); the rest are client-authored detail/lifecycle events. Domain effects
// (SET_HTML, …) are declared per module.
export enum EventDocEffect {
  InitState = 'INIT_STATE',
  SetCode = 'SET_CODE',
  SetName = 'SET_NAME',
  CreateDraft = 'CREATE_DRAFT',
  Publish = 'PUBLISH',

  // Soft delete lives in the log, not on a record. `deletedAt` used to be written straight
  // onto the summary, which made the summary hold state no fold could reproduce — rebuilding
  // it would have resurrected deleted documents. As events, deletion and restoration are
  // history like everything else, and every projection derives them.
  Delete = 'DELETE',
  Restore = 'RESTORE',
}
