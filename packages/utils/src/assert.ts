export function invariant(condition: unknown, message = "Invariant failed"): asserts condition {
  if (!condition) throw new Error(message);
}
export function assertNever(value: never, message = "Unexpected value"): never {
  throw new Error(`${message}: ${String(value)}`);
}
