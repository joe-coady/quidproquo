import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { createQpqRuntimeComputed, createQpqRuntimeDefinition, QpqRuntimeComputed } from '../hooks/asmj/createQpqRuntimeDefinition';
import { useFieldBinding } from './useFieldBinding';

type State = { name: string };

const buildComputed = (initial: State) => {
  const definition = createQpqRuntimeDefinition<State, unknown, {}>({}, initial);
  return createQpqRuntimeComputed(definition, (s) => s.name);
};

describe('useFieldBinding', () => {
  it('seeds the value from the computed atom', () => {
    const computed = buildComputed({ name: 'seed' });
    const { result } = renderHook(() => useFieldBinding(computed, vi.fn()));

    expect(result.current[0]).toBe('seed');
  });

  it('reads the value from the event target by default and calls the setter', () => {
    const computed = buildComputed({ name: 'seed' });
    const setter = vi.fn();
    const { result } = renderHook(() => useFieldBinding<State, string>(computed, setter));

    act(() => result.current[1]({ target: { value: 'typed' } } as any));

    expect(result.current[0]).toBe('typed');
    expect(setter).toHaveBeenCalledWith('typed');
  });

  it('uses a custom value extractor when provided', () => {
    const computed = buildComputed({ name: 'seed' });
    const setter = vi.fn();
    const numericComputed = computed as unknown as QpqRuntimeComputed<State, number>;
    const { result } = renderHook(() => useFieldBinding<State, number, number>(numericComputed, setter, (event) => event * 2));

    act(() => result.current[1](5));

    expect(result.current[0]).toBe(10);
    expect(setter).toHaveBeenCalledWith(10);
  });
});
