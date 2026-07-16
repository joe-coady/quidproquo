import { AskResponse, askStateRead } from 'quidproquo-core';

import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// The workspace state is the ROOT runtime state wherever a workspace runs (a
// useQpqRuntime atom on the web, askReduceState in tests and pure logic), so a bare
// read returns it whole.
export function* askEventDocWorkspaceReadState(): AskResponse<EventDocWorkspaceState> {
  return yield* askStateRead<EventDocWorkspaceState>();
}
