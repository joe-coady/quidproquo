import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import {
  createQpqRuntimeComputed,
  createQpqRuntimeDefinition,
  useQpqRuntimeComputed,
  useQpqRuntimeState,
} from './createQpqRuntimeDefinition';

type State = { count: number };
const initialState: State = { count: 0 };
const api = {};

describe('createQpqRuntimeDefinition', () => {
  it('returns the same atom info for the same name', () => {
    const definition = createQpqRuntimeDefinition<State, unknown, typeof api>(api, initialState);

    expect(definition('a')).toBe(definition('a'));
    expect(definition()).toBe(definition());
  });

  it('returns distinct atom info for different names', () => {
    const definition = createQpqRuntimeDefinition<State, unknown, typeof api>(api, initialState);

    expect(definition('a')).not.toBe(definition('b'));
  });

  it('seeds the atom info with the initial state, reducer and api', () => {
    const reducer = (s: State): [State, boolean] => [s, false];
    const definition = createQpqRuntimeDefinition<State, unknown, typeof api>(api, initialState, reducer);

    expect(definition('a')).toMatchObject({ initialState, reducer, api, state: initialState });
  });
});

describe('useQpqRuntimeState', () => {
  it('reads and updates the runtime state', () => {
    const definition = createQpqRuntimeDefinition<State, unknown, typeof api>(api, initialState);
    const { result } = renderHook(() => useQpqRuntimeState(definition, 'a'));

    expect(result.current[0]).toEqual({ count: 0 });

    act(() => result.current[1]({ count: 5 }));

    expect(result.current[0]).toEqual({ count: 5 });
    expect(result.current[2]()).toEqual({ count: 5 });
  });
});

describe('createQpqRuntimeComputed / useQpqRuntimeComputed', () => {
  it('derives a slice of the runtime state', () => {
    const definition = createQpqRuntimeDefinition<State, unknown, typeof api>(api, { count: 7 });
    const computed = createQpqRuntimeComputed(definition, (s) => s.count);

    const { result } = renderHook(() => useQpqRuntimeComputed(computed, 'a'));

    expect(result.current).toBe(7);
  });

  it('reflects updates written through the runtime state', () => {
    const definition = createQpqRuntimeDefinition<State, unknown, typeof api>(api, { count: 1 });
    const computed = createQpqRuntimeComputed(definition, (s) => s.count);

    const { result } = renderHook(() => {
      const value = useQpqRuntimeComputed(computed, 'shared');
      const [, setState] = useQpqRuntimeState(definition, 'shared');
      return { value, setState };
    });

    expect(result.current.value).toBe(1);

    act(() => result.current.setState({ count: 9 }));

    expect(result.current.value).toBe(9);
  });
});
