/**
 * Returns a function that will call all functions in the order they were chained with the same arguments.
 */
export function chain<Args extends [] | any[]>(callbacks: {
  [Symbol.iterator](): IterableIterator<((...args: Args) => any) | undefined>;
}): (...args: Args) => void {
  return (...args: Args) => {
    for (const callback of callbacks) {
      if (callback) callback(...args);
    }
  };
}

/**
 * Calls a JSX event handler prop, which is either a function or a `[handler, data]` tuple.
 */
export function callHandler<E extends Event>(handler: unknown, event: E): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler) && typeof handler[0] === 'function') handler[0](handler[1], event);
}
