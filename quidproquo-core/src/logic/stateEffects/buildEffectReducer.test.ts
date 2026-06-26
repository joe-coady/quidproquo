import { describe, expect, it } from 'vitest';

import { buildEffectReducer } from './buildEffectReducer';

interface CounterState {
  count: number;
}

type CounterEffect = { type: 'add'; payload: number } | { type: 'reset'; payload: undefined };

const reducer = buildEffectReducer<CounterState, CounterEffect>({
  add: (state, amount) => ({ count: state.count + amount }),
  reset: () => ({ count: 0 }),
});

describe('buildEffectReducer', () => {
  it('applies a handled effect and flags it as handled', () => {
    expect(reducer({ count: 1 }, { type: 'add', payload: 4 })).toEqual([{ count: 5 }, true]);
  });

  it('returns the untouched state and false for an unhandled effect', () => {
    const state = { count: 1 };
    const [next, handled] = reducer(state, { type: 'unknown', payload: undefined } as unknown as CounterEffect);

    expect(handled).toBe(false);
    expect(next).toBe(state);
  });
});
