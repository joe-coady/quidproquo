import { createElement, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { BubbleReducerDispatchContext, QpqBubbleReducer, useQpqRuntimeBubblingReducer } from './bubbleReducer';
import { createQpqRuntimeDefinition } from './createQpqRuntimeDefinition';

type State = { count: number };

const buildRuntime = (reducer: QpqBubbleReducer<State, any>) =>
  createQpqRuntimeDefinition<State, any, {}>({}, { count: 0 }, reducer);

describe('useQpqRuntimeBubblingReducer', () => {
  it('updates the runtime state when the reducer prevents bubbling', () => {
    const runtime = buildRuntime((state, action) => [{ count: state.count + action.by }, true]);
    const { result } = renderHook(() => useQpqRuntimeBubblingReducer(runtime, 'a'));

    act(() => result.current[1]({ by: 4 }));

    expect(result.current[0]).toEqual({ count: 4 });
    expect(result.current[2]()).toEqual({ count: 4 });
  });

  it('forwards the action to the parent dispatch when not prevented', () => {
    const parentDispatch = vi.fn();
    const runtime = buildRuntime((state) => [state, false]);
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(BubbleReducerDispatchContext.Provider, { value: parentDispatch }, children);

    const { result } = renderHook(() => useQpqRuntimeBubblingReducer(runtime, 'b'), { wrapper });

    act(() => result.current[1]({ type: 'noop' }));

    expect(parentDispatch).toHaveBeenCalledWith({ type: 'noop' });
  });
});
