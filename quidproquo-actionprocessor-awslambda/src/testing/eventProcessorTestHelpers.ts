import { ActionProcessorListResolver, buildTestQpqConfig, EventActionType, QPQConfig, QPQError } from 'quidproquo-core';

// Resolves a single event action processor from its resolver. Every event resolver in this
// package returns `{ [EventActionType.X]: processor }`, so tests only ever want the one
// processor function keyed by the action type. Defaults to a minimal app config when the
// processor under test does not read anything specific out of it.
export const resolveEventProcessor = async <Processor extends (...args: any[]) => Promise<[unknown, QPQError?]>>(
  resolver: ActionProcessorListResolver,
  actionType: EventActionType,
  qpqConfig: QPQConfig = buildTestQpqConfig(),
): Promise<Processor> => {
  const processors = await resolver(qpqConfig, null as any);
  return processors[actionType] as Processor;
};
