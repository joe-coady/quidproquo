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
}
