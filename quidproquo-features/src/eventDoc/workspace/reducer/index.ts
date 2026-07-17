// stateUpdaters stay internal (imported by createEventDocWorkspaceReducer); only the
// reducer factory and the pure log/config helpers are part of the public surface.
export * from './coalesceWorkspaceEvents';
export * from './createEventDocWorkspaceReducer';
export * from './getSlotCoalesceRules';
export * from './renumberWorkspaceEvents';
