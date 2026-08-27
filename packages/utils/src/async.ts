export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
export function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, waitMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: TArgs) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}
