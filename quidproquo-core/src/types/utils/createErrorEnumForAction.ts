export function createErrorTypeEnumValue(base: string, error: string): string {
  return `${base}-${error}`;
}

export function createErrorEnumForAction<T extends string>(
  base: string,
  values: T[],
): { [K in T | 'GenericError']: string } {
  const extendedValues = [...values, 'GenericError' as T];

  const errorEnum = extendedValues.reduce(
    (acc, value) => {
      acc[value] = createErrorTypeEnumValue(base, value);
      return acc;
    },
    {} as { [K in T | 'GenericError']: string },
  );

  return errorEnum;
}
