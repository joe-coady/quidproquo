import { DecomposedString, DecomposedStringPrimitive } from '../../types';

export function decomposedStringToString(
  [strings, values]: DecomposedString,
  valueResolver: (value: DecomposedStringPrimitive) => string = (v) => String(v),
) {
  return values.reduce(
    (str: string, value: DecomposedStringPrimitive, index: number) => `${str}${valueResolver(value)}${strings[index + 1]}`,
    strings[0],
  );
}
