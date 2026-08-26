export function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}
export function compact<T>(items: readonly (T | null | undefined | false)[]): T[] {
  return items.filter(Boolean) as T[];
}
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) throw new RangeError("size must be a positive integer");
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size)
    result.push(items.slice(index, index + size));
  return result;
}
