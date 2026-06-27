import { AskResponse, askStateRead } from 'quidproquo-core';
import { askStateDispatch } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { createQpqRuntimeDefinition } from './createQpqRuntimeDefinition';
import { useQpqRuntime } from './useQpqRuntime';

type State = { count: number };

const reducer = (state: State, action: { type: 'inc' }): [State, boolean] =>
  action.type === 'inc' ? [{ count: state.count + 1 }, true] : [state, false];

function* askReadCount(): AskResponse<State> {
  return yield* askStateRead<State>();
}

function* askIncrement(): AskResponse<void> {
  yield* askStateDispatch({ type: 'inc' });
}

const api = { askReadCount };

describe('useQpqRuntime', () => {
  it('exposes the api with the ask prefix removed and lower-cased', async () => {
    const runtime = createQpqRuntimeDefinition<State, { type: 'inc' }, typeof api>(api, { count: 0 }, reducer);
    const { result } = renderHook(() => useQpqRuntime(runtime, undefined, 'read'));

    const [mappedApi] = result.current;
    expect(typeof (mappedApi as any).readCount).toBe('function');

    await expect((mappedApi as any).readCount()).resolves.toEqual({ count: 0 });
  });

  it('dispatches actions through the bubbling reducer', async () => {
    const runtime = createQpqRuntimeDefinition<State, { type: 'inc' }, typeof api>(api, { count: 0 }, reducer);
    const { result } = renderHook(() => useQpqRuntime(runtime, undefined, 'dispatch'));

    act(() => result.current[2]({ type: 'inc' }));

    await waitFor(() => expect(result.current[1]).toEqual({ count: 1 }));
  });

  it('runs the main story on mount', async () => {
    const runtime = createQpqRuntimeDefinition<State, { type: 'inc' }, typeof api>(api, { count: 0 }, reducer);
    const { result } = renderHook(() => useQpqRuntime(runtime, askIncrement, 'main'));

    await waitFor(() => expect(result.current[1]).toEqual({ count: 1 }));
  });
});
