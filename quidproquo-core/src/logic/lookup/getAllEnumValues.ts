export function getAllEnumValues<T extends Record<string, any>>(enumObj: T): T[] {
  return Object.values(enumObj) as unknown as T[];
}
