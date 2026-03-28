import { describe, expect, it } from 'vitest';

import { DateActionType } from '../../actions/date/DateActionType';
import { askDateNow } from '../../actions/date/DateNowActionRequester';
import { ErrorActionType } from '../../actions/error/ErrorActionType';
import { GuidActionType } from '../../actions/guid/GuidActionType';
import { askNewGuid } from '../../actions/guid/GuidNewActionRequester';
import { MathActionType } from '../../actions/math/MathActionType';
import { askRandomNumber } from '../../actions/math/MathRandomNumberActionRequester';
import { SystemActionType } from '../../actions/system/SystemActionType';
import { Action, AskResponse, EitherActionResult } from '../../types';
import { askCatch } from './askCatch';
import {
  ActionOverrideMap,
  askOverrideActions,
  getSuccessfulEitherActionResultIfRequired,
} from './askOverrideActions';
import { askRunParallel } from './askRunParallel';

// ─── Runtime Simulator ───────────────────────────────────────────────────────
// Drives a generator to completion, acting as the QPQ runtime.
// Responds to yielded actions based on a configurable response map.

interface SimulatorError {
  __simulateError: true;
  errorType: string;
  errorText: string;
  errorStack?: string;
}

type ResponseMap = Record<string, any>;

function simulatorError(errorType: string, errorText: string): SimulatorError {
  return { __simulateError: true, errorType, errorText };
}

function isSimulatorError(val: any): val is SimulatorError {
  return val && val.__simulateError === true;
}

function processActionResponse(action: any, responses: ResponseMap): any {
  if (action.type === SystemActionType.Batch) {
    return processBatchResponse(action, responses);
  }

  const raw = responses[action.type];

  if (isSimulatorError(raw)) {
    if (action.returnErrors) {
      return { success: false, error: { errorType: raw.errorType, errorText: raw.errorText } };
    }
    throw new Error(`Action ${action.type} errored without returnErrors protection`);
  }

  if (action.returnErrors) {
    return { success: true, result: raw };
  }
  return raw;
}

function processBatchResponse(batchAction: any, responses: ResponseMap): any {
  const subActions: any[] = batchAction.payload.actions;
  const subResults: any[] = [];
  let batchError: any = null;

  for (const sub of subActions) {
    const raw = sub.type === SystemActionType.Batch
      ? processBatchResponse(sub, responses)
      : responses[sub.type];

    if (isSimulatorError(raw)) {
      if (sub.returnErrors) {
        subResults.push({ success: false, error: { errorType: raw.errorType, errorText: raw.errorText } });
      } else {
        batchError = { errorType: raw.errorType, errorText: raw.errorText };
        break;
      }
    } else if (sub.returnErrors) {
      subResults.push({ success: true, result: raw });
    } else {
      subResults.push(raw);
    }
  }

  if (batchError) {
    if (batchAction.returnErrors) {
      return { success: false, error: batchError };
    }
    throw new Error(`Batch failed without returnErrors: ${JSON.stringify(batchError)}`);
  }

  if (batchAction.returnErrors) {
    return { success: true, result: subResults };
  }
  return subResults;
}

interface SimulatorResult {
  result: any;
  yieldedActions: any[];
  threwError?: any;
}

function simulateRuntime(gen: Generator<any, any, any>, responses: ResponseMap): SimulatorResult {
  const yieldedActions: any[] = [];
  let next = gen.next();

  while (!next.done) {
    const action = next.value;
    yieldedActions.push(action);

    if (action.type === ErrorActionType.ThrowError) {
      return { result: undefined, yieldedActions, threwError: action.payload };
    }

    const response = processActionResponse(action, responses);
    next = gen.next(response);
  }

  return { result: next.value, yieldedActions };
}

// ─── Test Helpers ────────────────────────────────────────────────────────────

const MOCK_RANDOM = 0.88;
const MOCK_DATE = 1711234567890;
const MOCK_GUID = 'test-guid-abc-123';

const defaultResponses: ResponseMap = {
  [MathActionType.RandomNumber]: MOCK_RANDOM,
  [DateActionType.Now]: MOCK_DATE,
  [GuidActionType.New]: MOCK_GUID,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('getSuccessfulEitherActionResultIfRequired', () => {
  it('wraps value in EitherActionResult when returnErrors is true', () => {
    expect(getSuccessfulEitherActionResultIfRequired(0.88, true)).toEqual({
      success: true,
      result: 0.88,
    });
  });

  it('returns raw value when returnErrors is false', () => {
    expect(getSuccessfulEitherActionResultIfRequired(0.88, false)).toBe(0.88);
  });

  it('returns raw value when returnErrors is undefined', () => {
    expect(getSuccessfulEitherActionResultIfRequired(0.88, undefined)).toBe(0.88);
  });

  it('wraps null correctly', () => {
    expect(getSuccessfulEitherActionResultIfRequired(null, true)).toEqual({
      success: true,
      result: null,
    });
  });

  it('wraps undefined correctly', () => {
    expect(getSuccessfulEitherActionResultIfRequired(undefined, true)).toEqual({
      success: true,
      result: undefined,
    });
  });

  it('wraps complex objects correctly', () => {
    const obj = { a: 1, b: [2, 3] };
    expect(getSuccessfulEitherActionResultIfRequired(obj, true)).toEqual({
      success: true,
      result: { a: 1, b: [2, 3] },
    });
  });
});

describe('askOverrideActions', () => {
  // ─── Simple non-batch scenarios ──────────────────────────────────────────

  describe('simple non-batch scenarios', () => {
    it('returns final value when story yields no actions', () => {
      function* story(): AskResponse<number> {
        return 42;
      }

      const gen = askOverrideActions(story(), {});
      const result = gen.next();
      expect(result.done).toBe(true);
      expect(result.value).toBe(42);
    });

    it('yields non-overridden action through to runtime', () => {
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const gen = askOverrideActions(story(), {});
      const step1 = gen.next();
      expect(step1.done).toBe(false);
      expect(step1.value).toEqual({ type: MathActionType.RandomNumber });

      const step2 = gen.next(0.42);
      expect(step2.done).toBe(true);
      expect(step2.value).toBe(0.42);
    });

    it('yields multiple non-overridden actions in sequence', () => {
      function* story(): AskResponse<[number, number, string]> {
        const r = yield* askRandomNumber();
        const d = yield* askDateNow();
        const g = yield* askNewGuid();
        return [r, d, g];
      }

      const gen = askOverrideActions(story(), {});

      const s1 = gen.next();
      expect(s1.value).toEqual({ type: MathActionType.RandomNumber });

      const s2 = gen.next(MOCK_RANDOM);
      expect(s2.value).toEqual({ type: DateActionType.Now });

      const s3 = gen.next(MOCK_DATE);
      expect(s3.value).toEqual({ type: GuidActionType.New });

      const s4 = gen.next(MOCK_GUID);
      expect(s4.done).toBe(true);
      expect(s4.value).toEqual([MOCK_RANDOM, MOCK_DATE, MOCK_GUID]);
    });

    it('intercepts action with matching type override', () => {
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();

      // Override handled it — no action yielded to runtime
      expect(result.done).toBe(true);
      expect(result.value).toBe(MOCK_RANDOM);
    });

    it('intercepts action with wildcard override', () => {
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        '*': function* () {
          return 0.99;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();
      expect(result.done).toBe(true);
      expect(result.value).toBe(0.99);
    });

    it('specific type override takes priority over wildcard', () => {
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return 0.55;
        },
        '*': function* () {
          return 0.99;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();
      expect(result.done).toBe(true);
      expect(result.value).toBe(0.55);
    });

    it('override handler can yield its own actions to runtime', () => {
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          // Override random by fetching the date and deriving from it
          const date: number = yield { type: DateActionType.Now };
          return date % 1000;
        },
      };

      const gen = askOverrideActions(story(), overrides);

      // The override handler yields a date action to the runtime
      const s1 = gen.next();
      expect(s1.done).toBe(false);
      expect(s1.value).toEqual({ type: DateActionType.Now });

      const s2 = gen.next(MOCK_DATE);
      expect(s2.done).toBe(true);
      expect(s2.value).toBe(MOCK_DATE % 1000);
    });

    it('override handler with multiple yields', () => {
      function* story(): AskResponse<string> {
        return yield* askRandomNumber() as any;
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          const date: number = yield { type: DateActionType.Now };
          const guid: string = yield { type: GuidActionType.New };
          return `${date}-${guid}`;
        },
      };

      const gen = askOverrideActions(story(), overrides);

      const s1 = gen.next();
      expect(s1.value).toEqual({ type: DateActionType.Now });

      const s2 = gen.next(MOCK_DATE);
      expect(s2.value).toEqual({ type: GuidActionType.New });

      const s3 = gen.next(MOCK_GUID);
      expect(s3.done).toBe(true);
      expect(s3.value).toBe(`${MOCK_DATE}-${MOCK_GUID}`);
    });

    it('override result feeds back to story correctly, story continues', () => {
      function* story(): AskResponse<{ random: number; date: number }> {
        const random = yield* askRandomNumber();
        const date = yield* askDateNow();
        return { random, date };
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const gen = askOverrideActions(story(), overrides);

      // Random is overridden, so next yielded action is DateNow
      const s1 = gen.next();
      expect(s1.done).toBe(false);
      expect(s1.value).toEqual({ type: DateActionType.Now });

      const s2 = gen.next(MOCK_DATE);
      expect(s2.done).toBe(true);
      expect(s2.value).toEqual({ random: MOCK_RANDOM, date: MOCK_DATE });
    });

    it('mixed overridden and non-overridden actions across multiple yields', () => {
      function* story(): AskResponse<[number, number, string]> {
        const r = yield* askRandomNumber(); // overridden
        const d = yield* askDateNow(); // passthrough
        const g = yield* askNewGuid(); // overridden
        return [r, d, g];
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
        [GuidActionType.New]: function* () {
          return MOCK_GUID;
        },
      };

      const gen = askOverrideActions(story(), overrides);

      // Random overridden, guid overridden — only DateNow yielded to runtime
      const s1 = gen.next();
      expect(s1.done).toBe(false);
      expect(s1.value).toEqual({ type: DateActionType.Now });

      const s2 = gen.next(MOCK_DATE);
      expect(s2.done).toBe(true);
      expect(s2.value).toEqual([MOCK_RANDOM, MOCK_DATE, MOCK_GUID]);
    });

    it('override returning undefined feeds undefined back to story', () => {
      function* story(): AskResponse<number | undefined> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return undefined;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();
      expect(result.done).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it('story ignores override result and returns its own value', () => {
      function* story(): AskResponse<string> {
        yield* askRandomNumber(); // result ignored
        return 'my-own-value';
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();
      expect(result.done).toBe(true);
      expect(result.value).toBe('my-own-value');
    });
  });

  // ─── returnErrors handling ───────────────────────────────────────────────

  describe('returnErrors handling', () => {
    it('wraps override result in EitherActionResult when returnErrors is true', () => {
      function* story(): AskResponse<EitherActionResult<number>> {
        return (yield { type: MathActionType.RandomNumber, returnErrors: true }) as EitherActionResult<number>;
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();
      expect(result.done).toBe(true);
      expect(result.value).toEqual({ success: true, result: MOCK_RANDOM });
    });

    it('passes raw value when returnErrors is false', () => {
      function* story(): AskResponse<number> {
        return (yield { type: MathActionType.RandomNumber, returnErrors: false }) as number;
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();
      expect(result.done).toBe(true);
      expect(result.value).toBe(MOCK_RANDOM);
    });

    it('non-overridden action with returnErrors yields unchanged to runtime', () => {
      function* story(): AskResponse<EitherActionResult<number>> {
        return (yield { type: MathActionType.RandomNumber, returnErrors: true }) as EitherActionResult<number>;
      }

      const gen = askOverrideActions(story(), {});

      const s1 = gen.next();
      expect(s1.done).toBe(false);
      // Action passes through with returnErrors intact
      expect(s1.value).toEqual({ type: MathActionType.RandomNumber, returnErrors: true });

      const mockResponse: EitherActionResult<number> = { success: true, result: MOCK_RANDOM };
      const s2 = gen.next(mockResponse);
      expect(s2.done).toBe(true);
      expect(s2.value).toEqual(mockResponse);
    });
  });

  // ─── Batch scenarios ─────────────────────────────────────────────────────

  describe('batch scenarios', () => {
    it('batch with no overrides passes all actions to runtime', () => {
      function* story(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      const { result } = simulateRuntime(
        askOverrideActions(story(), {}),
        defaultResponses,
      );

      expect(result).toEqual([MOCK_RANDOM, MOCK_DATE]);
    });

    it('batch with all actions overridden handles everything internally', () => {
      function* story(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
        [DateActionType.Now]: function* () {
          return MOCK_DATE;
        },
      };

      const { result, yieldedActions } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual([MOCK_RANDOM, MOCK_DATE]);
      // Only an empty batch should be yielded (from askCatch(askBatch([])))
      const nonEmptyBatches = yieldedActions.filter(
        (a) => a.type === SystemActionType.Batch && a.payload.actions.length > 0,
      );
      expect(nonEmptyBatches).toHaveLength(0);
    });

    it('mixed batch: some overridden, some passthrough — correct order', () => {
      function* story(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      // Random overridden to 0.88, DateNow from runtime
      expect(result).toEqual([MOCK_RANDOM, MOCK_DATE]);
    });

    it('three-way batch with middle one overridden', () => {
      function* story(): AskResponse<[number, number, string]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow(), askNewGuid()]);
      }

      const overrides: ActionOverrideMap = {
        [DateActionType.Now]: function* () {
          return MOCK_DATE;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual([MOCK_RANDOM, MOCK_DATE, MOCK_GUID]);
    });

    it('batch runtime failure without returnErrors triggers askThrowError', () => {
      function* story(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const failResponses: ResponseMap = {
        ...defaultResponses,
        [DateActionType.Now]: simulatorError('GenericError', 'Date service down'),
      };

      const { threwError } = simulateRuntime(
        askOverrideActions(story(), overrides),
        failResponses,
      );

      expect(threwError).toBeDefined();
      expect(threwError.errorType).toBe('GenericError');
      expect(threwError.errorText).toBe('Date service down');
    });

    it('batch runtime failure with returnErrors passes error back to story', () => {
      function* story(): AskResponse<EitherActionResult<[number, number]>> {
        return yield* askCatch(askRunParallel([askRandomNumber(), askDateNow()]));
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const failResponses: ResponseMap = {
        ...defaultResponses,
        [DateActionType.Now]: simulatorError('GenericError', 'Date service down'),
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        failResponses,
      );

      expect(result.success).toBe(false);
      expect(result.error.errorType).toBe('GenericError');
      expect(result.error.errorText).toBe('Date service down');
    });
  });

  // ─── askCatch composition ────────────────────────────────────────────────

  describe('askCatch composition', () => {
    it('askCatch + override returns successful EitherActionResult', () => {
      function* story(): AskResponse<EitherActionResult<number>> {
        return yield* askCatch(askRandomNumber());
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const { result, yieldedActions } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual({ success: true, result: MOCK_RANDOM });
      // Override handled it — no real actions should reach the runtime
      // (may have empty batch from internal mechanics)
      const realActions = yieldedActions.filter(
        (a) => a.type !== SystemActionType.Batch || a.payload.actions.length > 0,
      );
      expect(realActions).toHaveLength(0);
    });

    it('askCatch + no override passes through to runtime', () => {
      function* story(): AskResponse<EitherActionResult<number>> {
        return yield* askCatch(askRandomNumber());
      }

      const { result } = simulateRuntime(
        askOverrideActions(story(), {}),
        defaultResponses,
      );

      expect(result).toEqual({ success: true, result: MOCK_RANDOM });
    });

    it('askCatch + askRunParallel + partial override', () => {
      function* story(): AskResponse<EitherActionResult<[number, number]>> {
        return yield* askCatch(askRunParallel([askRandomNumber(), askDateNow()]));
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual({ success: true, result: [MOCK_RANDOM, MOCK_DATE] });
    });

    it('askCatch + askRunParallel + all overridden', () => {
      function* story(): AskResponse<EitherActionResult<[number, number, string]>> {
        return yield* askCatch(
          askRunParallel([askRandomNumber(), askDateNow(), askNewGuid()]),
        );
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
        [DateActionType.Now]: function* () {
          return MOCK_DATE;
        },
        [GuidActionType.New]: function* () {
          return MOCK_GUID;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual({ success: true, result: [MOCK_RANDOM, MOCK_DATE, MOCK_GUID] });
    });
  });

  // ─── Nested batch scenarios ──────────────────────────────────────────────

  describe('nested batch scenarios', () => {
    it('batch containing a nested batch with overridden inner actions', () => {
      function* innerStory(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      function* story(): AskResponse<[[number, number], string]> {
        return yield* askRunParallel([innerStory(), askNewGuid()]);
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual([[MOCK_RANDOM, MOCK_DATE], MOCK_GUID]);
    });

    it('deeply nested batches (3 levels) with override at deepest level', () => {
      function* level1(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      function* level2(): AskResponse<[number, number]> {
        return yield* askRunParallel([level1(), askDateNow()]);
      }

      function* story(): AskResponse<[[number, number], string]> {
        return yield* askRunParallel([level2(), askNewGuid()]);
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual([[MOCK_RANDOM, MOCK_DATE], MOCK_GUID]);
    });

    it('nested batch with all actions overridden at every level', () => {
      function* innerStory(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      function* story(): AskResponse<[[number, number], string]> {
        return yield* askRunParallel([innerStory(), askNewGuid()]);
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
        [DateActionType.Now]: function* () {
          return MOCK_DATE;
        },
        [GuidActionType.New]: function* () {
          return MOCK_GUID;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual([[MOCK_RANDOM, MOCK_DATE], MOCK_GUID]);
    });

    it('nested batch with askCatch at every level', () => {
      function* innerStory(): AskResponse<EitherActionResult<[number, number]>> {
        return yield* askCatch(askRunParallel([askRandomNumber(), askDateNow()]));
      }

      function* story(): AskResponse<EitherActionResult<[EitherActionResult<[number, number]>, string]>> {
        return yield* askCatch(askRunParallel([innerStory(), askNewGuid()]));
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual({
        success: true,
        result: [{ success: true, result: [MOCK_RANDOM, MOCK_DATE] }, MOCK_GUID],
      });
    });
  });

  // ─── Wildcard behavior ───────────────────────────────────────────────────

  describe('wildcard behavior', () => {
    it('wildcard does NOT intercept batch actions', () => {
      function* story(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      const overrides: ActionOverrideMap = {
        '*': function* () {
          return 'wildcard-caught';
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      // Wildcard catches individual actions inside the batch, not the batch itself
      // Both Random and DateNow are caught by wildcard
      expect(result).toEqual(['wildcard-caught', 'wildcard-caught']);
    });

    it('wildcard catches actions inside nested batches', () => {
      function* innerStory(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      function* story(): AskResponse<[[number, number], string]> {
        return yield* askRunParallel([innerStory(), askNewGuid()]);
      }

      const overrides: ActionOverrideMap = {
        '*': function* (action: Action<any>) {
          return `wildcard-${action.type}`;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual([
        [`wildcard-${MathActionType.RandomNumber}`, `wildcard-${DateActionType.Now}`],
        `wildcard-${GuidActionType.New}`,
      ]);
    });

    it('specific overrides take priority over wildcard inside batches', () => {
      function* story(): AskResponse<[number, number, string]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow(), askNewGuid()]);
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
        '*': function* () {
          return 'wildcard-fallback';
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      // Random: specific override → 0.88
      // DateNow: wildcard → 'wildcard-fallback'
      // Guid: wildcard → 'wildcard-fallback'
      expect(result).toEqual([MOCK_RANDOM, 'wildcard-fallback', 'wildcard-fallback']);
    });

    it('wildcard handler that yields sub-actions', () => {
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        '*': function* () {
          const date: number = yield { type: DateActionType.Now };
          return date + 1;
        },
      };

      const gen = askOverrideActions(story(), overrides);

      const s1 = gen.next();
      expect(s1.done).toBe(false);
      expect(s1.value).toEqual({ type: DateActionType.Now });

      const s2 = gen.next(MOCK_DATE);
      expect(s2.done).toBe(true);
      expect(s2.value).toBe(MOCK_DATE + 1);
    });
  });

  // ─── Overriding batch actions directly ───────────────────────────────────

  describe('overriding batch actions directly', () => {
    it('specific override for SystemActionType.Batch IS respected', () => {
      function* story(): AskResponse<any> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      const overrides: ActionOverrideMap = {
        [SystemActionType.Batch]: function* (action: Action<any>) {
          // Intercept the entire batch and return custom results
          return ['batch-override-a', 'batch-override-b'];
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();

      // The batch override runs immediately, returning its value.
      // askRunParallel feeds these back to the sub-generators.
      // askRandomNumber gets 'batch-override-a', askDateNow gets 'batch-override-b'.
      // Both are done. askRunParallel returns the array.
      expect(result.done).toBe(true);
      expect(result.value).toEqual(['batch-override-a', 'batch-override-b']);
    });

    it('wildcard does NOT catch batch but specific batch override does', () => {
      function* story(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      // Wildcard alone: enters batch decomposition, catches inner actions
      const wildOnly: ActionOverrideMap = {
        '*': function* () {
          return 'wild';
        },
      };

      const { result: wildResult } = simulateRuntime(
        askOverrideActions(story(), wildOnly),
        defaultResponses,
      );
      expect(wildResult).toEqual(['wild', 'wild']);

      // Specific batch override: intercepts the batch itself
      function* story2(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      const batchOverride: ActionOverrideMap = {
        [SystemActionType.Batch]: function* () {
          return [111, 222];
        },
      };

      const gen2 = askOverrideActions(story2(), batchOverride);
      const result2 = gen2.next();
      expect(result2.done).toBe(true);
      expect(result2.value).toEqual([111, 222]);
    });
  });

  // ─── Complex composition tests ──────────────────────────────────────────

  describe('complex composition', () => {
    it('override handler that itself runs parallel sub-stories', () => {
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          // Override random by running two date fetches in parallel and summing
          const [d1, d2] = yield* askRunParallel([askDateNow(), askDateNow()]);
          return d1 + d2;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toBe(MOCK_DATE + MOCK_DATE);
    });

    it('override handler yields go to runtime, not through overrides', () => {
      // Important behavior: when an override handler yields an action,
      // that action goes to the runtime (parent), NOT through the override map.
      // This is because yield* on line 72 delegates to the parent.
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          // This yield goes to the runtime, not through the DateNow override
          const date: number = yield { type: DateActionType.Now };
          return date;
        },
        [DateActionType.Now]: function* () {
          return 99999; // This will NOT be called for yields from the handler above
        },
      };

      const gen = askOverrideActions(story(), overrides);

      // The handler's DateNow yield goes to the runtime
      const s1 = gen.next();
      expect(s1.done).toBe(false);
      expect(s1.value).toEqual({ type: DateActionType.Now });

      // Runtime responds
      const s2 = gen.next(MOCK_DATE);
      expect(s2.done).toBe(true);
      expect(s2.value).toBe(MOCK_DATE);
    });

    it('chained overrides work when story yields multiple actions', () => {
      // Overrides DO intercept actions yielded directly by the story
      function* story(): AskResponse<[number, number]> {
        const random = yield* askRandomNumber(); // overridden
        const date = yield* askDateNow(); // also overridden
        return [random, date];
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
        [DateActionType.Now]: function* () {
          return 99999;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();

      // Both intercepted by overrides — nothing yielded to runtime
      expect(result.done).toBe(true);
      expect(result.value).toEqual([MOCK_RANDOM, 99999]);
    });

    it('story with sequential dependencies and mixed overrides', () => {
      function* story(): AskResponse<string> {
        const random = yield* askRandomNumber(); // overridden → 0.88
        const date = yield* askDateNow(); // passthrough
        const guid = yield* askNewGuid(); // overridden → uses date from previous step
        return `${random}-${date}-${guid}`;
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
        [GuidActionType.New]: function* () {
          return 'custom-guid';
        },
      };

      const gen = askOverrideActions(story(), overrides);

      // Random overridden, only DateNow yields to runtime
      const s1 = gen.next();
      expect(s1.value).toEqual({ type: DateActionType.Now });

      // Guid overridden
      const s2 = gen.next(MOCK_DATE);
      expect(s2.done).toBe(true);
      expect(s2.value).toBe(`${MOCK_RANDOM}-${MOCK_DATE}-custom-guid`);
    });

    it('askCatch wrapping askOverrideActions with parallel + nested + failure', () => {
      function* innerStory(): AskResponse<[number, number]> {
        return yield* askRunParallel([askRandomNumber(), askDateNow()]);
      }

      function* story(): AskResponse<EitherActionResult<[[number, number], string]>> {
        return yield* askCatch(askRunParallel([innerStory(), askNewGuid()]));
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      // First: success case
      const successResult = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(successResult.result).toEqual({
        success: true,
        result: [[MOCK_RANDOM, MOCK_DATE], MOCK_GUID],
      });

      // Second: failure case (DateNow fails)
      // When DateNow fails inside a nested batch without its own askCatch,
      // the error propagates as askThrowError, which the outer askCatch should catch
      function* story2(): AskResponse<EitherActionResult<[[number, number], string]>> {
        return yield* askCatch(askRunParallel([
          (function* (): AskResponse<[number, number]> {
            return yield* askRunParallel([askRandomNumber(), askDateNow()]);
          })(),
          askNewGuid(),
        ]));
      }

      const failResponses: ResponseMap = {
        ...defaultResponses,
        [DateActionType.Now]: simulatorError('GenericError', 'Date service down'),
      };

      const failResult = simulateRuntime(
        askOverrideActions(story2(), overrides),
        failResponses,
      );

      // The error may surface as a thrown error (threwError) if askCatch can't
      // catch the askThrowError from the batch, or as a result if it can.
      // Either way, verify the error is captured.
      if (failResult.threwError) {
        expect(failResult.threwError.errorType).toBe('GenericError');
        expect(failResult.threwError.errorText).toBe('Date service down');
      } else {
        expect(failResult.result.success).toBe(false);
        expect(failResult.result.error.errorText).toBe('Date service down');
      }
    });

    it('multiple askOverrideActions nested (override within override context)', () => {
      function* innerStory(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      // Outer override intercepts DateNow, inner override intercepts Random
      function* story(): AskResponse<[number, number]> {
        const date = yield* askDateNow();
        const random = yield* askOverrideActions(innerStory(), {
          [MathActionType.RandomNumber]: function* () {
            return MOCK_RANDOM;
          },
        });
        return [date, random];
      }

      const outerOverrides: ActionOverrideMap = {
        [DateActionType.Now]: function* () {
          return MOCK_DATE;
        },
      };

      const gen = askOverrideActions(story(), outerOverrides);
      const result = gen.next();

      expect(result.done).toBe(true);
      expect(result.value).toEqual([MOCK_DATE, MOCK_RANDOM]);
    });
  });

  // ─── Edge cases ──────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('empty override map passes all actions through', () => {
      function* story(): AskResponse<number> {
        return yield* askRandomNumber();
      }

      const gen = askOverrideActions(story(), {});

      const s1 = gen.next();
      expect(s1.done).toBe(false);
      expect(s1.value).toEqual({ type: MathActionType.RandomNumber });

      const s2 = gen.next(MOCK_RANDOM);
      expect(s2.done).toBe(true);
      expect(s2.value).toBe(MOCK_RANDOM);
    });

    it('empty generator returns immediately', () => {
      function* story(): AskResponse<void> {
        return;
      }

      const gen = askOverrideActions(story(), {
        '*': function* () {
          return 'never-called';
        },
      });

      const result = gen.next();
      expect(result.done).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it('same action type yielded multiple times, each overridden', () => {
      function* story(): AskResponse<number[]> {
        const a = yield* askRandomNumber();
        const b = yield* askRandomNumber();
        const c = yield* askRandomNumber();
        return [a, b, c];
      }

      let callCount = 0;
      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          callCount++;
          return callCount * 10;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      const result = gen.next();

      expect(result.done).toBe(true);
      expect(result.value).toEqual([10, 20, 30]);
      expect(callCount).toBe(3);
    });

    it('override handler receives the full action object', () => {
      function* story(): AskResponse<any> {
        return (yield { type: MathActionType.RandomNumber, payload: { seed: 42 } }) as any;
      }

      let receivedAction: any = null;
      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* (action: Action<any>) {
          receivedAction = action;
          return MOCK_RANDOM;
        },
      };

      const gen = askOverrideActions(story(), overrides);
      gen.next();

      expect(receivedAction).toEqual({
        type: MathActionType.RandomNumber,
        payload: { seed: 42 },
      });
    });

    it('override with askCatch inside the handler', () => {
      function* story(): AskResponse<any> {
        return yield* askRandomNumber();
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          // Handler uses askCatch internally
          const result = yield* askCatch(askDateNow());
          return result;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual({ success: true, result: MOCK_DATE });
    });

    it('batch with single action uses askBatch optimization', () => {
      // When askBatch has 1 action, it yields the action directly (not as a batch)
      // This tests that the askCatch wrapping still works correctly
      function* story(): AskResponse<[number]> {
        return yield* askRunParallel([askRandomNumber()]);
      }

      const { result } = simulateRuntime(
        askOverrideActions(story(), {}),
        defaultResponses,
      );

      expect(result).toEqual([MOCK_RANDOM]);
    });

    it('large batch with many actions, partial overrides', () => {
      function* story(): AskResponse<number[]> {
        return yield* askRunParallel([
          askRandomNumber(),
          askDateNow(),
          askNewGuid(),
          askRandomNumber(),
          askDateNow(),
        ]) as any;
      }

      const overrides: ActionOverrideMap = {
        [MathActionType.RandomNumber]: function* () {
          return MOCK_RANDOM;
        },
      };

      const { result } = simulateRuntime(
        askOverrideActions(story(), overrides),
        defaultResponses,
      );

      expect(result).toEqual([MOCK_RANDOM, MOCK_DATE, MOCK_GUID, MOCK_RANDOM, MOCK_DATE]);
    });
  });
});
