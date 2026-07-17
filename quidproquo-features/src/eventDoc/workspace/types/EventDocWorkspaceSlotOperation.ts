// Which slot operation an error came from, so the UI can phrase it (a validation
// rejection reads differently to a failed network load or save).
export enum EventDocWorkspaceSlotOperation {
  validation = 'validation',
  load = 'load',
  save = 'save',
}
