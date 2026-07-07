import { createElement, useContext } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { BubbleReducerDispatchContext } from './bubbleReducer';
import { createQpqRuntimeDefinition } from './createQpqRuntimeDefinition';
import { QpqRuntimeEffectCatcher } from './QpqRuntimeEffectCatcher';

type State = { count: number };

describe('QpqRuntimeEffectCatcher', () => {
  it('renders children and provides a bubble dispatcher', () => {
    const runtime = createQpqRuntimeDefinition<State, { type: string }, {}>({}, { count: 0 }, (s) => [s, false]);

    let dispatch: ((action: any) => void) | undefined;
    const Probe = () => {
      dispatch = useContext(BubbleReducerDispatchContext);
      return createElement('span', null, 'child');
    };

    const { getByText } = render(createElement(QpqRuntimeEffectCatcher, { runtime, name: 'fx' }, createElement(Probe)));

    expect(getByText('child')).toBeDefined();
    expect(typeof dispatch).toBe('function');
  });
});
