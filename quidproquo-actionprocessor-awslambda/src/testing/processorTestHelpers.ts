import { QPQError } from 'quidproquo-core';

// The runtime arguments every action processor receives after its payload. Tests almost never
// care about these, so they are stubbed by default and only overridden where a test needs a real
// one (e.g. a story session, logger, dynamic module loader or stream registry).
export interface ProcessorRuntimeOverrides {
  session?: unknown;
  actionProcessors?: unknown;
  logger?: unknown;
  updateSession?: unknown;
  dynamicModuleLoader?: unknown;
  streamRegistry?: unknown;
}

type TestableProcessor<TResult> = (
  payload: any,
  session: any,
  actionProcessors: any,
  logger: any,
  updateSession: any,
  dynamicModuleLoader: any,
  streamRegistry: any,
) => Promise<[TResult?, QPQError?]>;

// invokeProcessor(processor, payload, overrides?) — calls an action processor with the given
// payload and stub runtime args, overridable for the rare test that needs a real runtime arg.
export const invokeProcessor = <TResult = unknown>(
  processor: TestableProcessor<TResult>,
  payload: unknown,
  overrides: ProcessorRuntimeOverrides = {},
): Promise<[TResult?, QPQError?]> =>
  processor(
    payload,
    overrides.session ?? {},
    overrides.actionProcessors ?? {},
    overrides.logger ?? {},
    overrides.updateSession ?? {},
    overrides.dynamicModuleLoader ?? {},
    overrides.streamRegistry ?? {},
  );
