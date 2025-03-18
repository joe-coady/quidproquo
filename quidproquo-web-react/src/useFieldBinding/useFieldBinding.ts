import { useEffect, useState } from 'react';

import { QpqRuntimeComputed, useQpqRuntimeComputed } from '../hooks';

export const useFieldBinding = <TState, V, E = any>(
  computedAtom: QpqRuntimeComputed<TState, V>,
  someSetter: (value: V) => Promise<void> | void,
  valueExtractor?: (event: E, ...args: any[]) => V,
): [V, (event: E, ...args: any[]) => void] => {
  const computedValue = useQpqRuntimeComputed(computedAtom);

  const [value, setValue] = useState<V>(computedValue);

  const handleChange = (event: E, ...args: any[]) => {
    const newValue: V = valueExtractor ? valueExtractor(event, ...args) : (event as any).target.value;
    setValue(newValue);
    someSetter(newValue);
  };

  useEffect(() => {
    if (computedValue !== value) {
      setValue(computedValue);
    }
  }, [computedValue]);

  return [value, handleChange];
};
