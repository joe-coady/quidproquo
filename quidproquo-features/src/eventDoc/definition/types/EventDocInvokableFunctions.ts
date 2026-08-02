import { Nullable } from 'quidproquo-core';

import { EventDocEvent, EventDocLink, EventDocRenderInput, EventDocRenderResult, EventDocSnapshotViews } from '../../models';

// The INVOCATION-side view of EventDocFunctions: every member required and typed by its
// resolved result, so it satisfies the DynamicFunctions constraint and types
// askDynamicFunctionExecute calls (member name, positional args, unwrapped result).
// Registration-side optionality (a collection with no render) surfaces at runtime as the
// processor's FunctionNotFound, which the render/references call sites map to their
// not-configured behaviour.
export type EventDocInvokableFunctions = {
  foldSnapshotViews: (events: EventDocEvent[], seedViews?: EventDocSnapshotViews) => Nullable<EventDocSnapshotViews>;
  collectReferences: (events: EventDocEvent[]) => EventDocLink[];
  render: (input: EventDocRenderInput) => EventDocRenderResult;
};
