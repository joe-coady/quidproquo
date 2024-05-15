export function uniqueBy<T>(array: T[], keyFn: (item: T) => any): T[] {
  const seen = new Set<any>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
