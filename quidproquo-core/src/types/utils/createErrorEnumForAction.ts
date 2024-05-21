export function createErrorTypeEnumValue(base: string, error: string): string {
  return `${base}-${error}`;
}

export function createErrorEnumForAction<T extends string>(base: string, values: T[]): { [K in T]: string } {
  const errorEnum = values.reduce(
    (acc, value) => {
      acc[value] = createErrorTypeEnumValue(base, value);
      return acc;
    },
    {} as { [K in T]: string },
  );

  return errorEnum;
}
