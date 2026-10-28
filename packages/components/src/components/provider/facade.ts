import { getOwner, onCleanup } from 'solid-js';
import { isDev, isServer } from '@solidjs/web';

/** A warning in development only. */
export function warn(message: string) {
  if (isDev) console.warn(`[slopkit] ${message}`);
}

export interface FacadeRegistry<T> {
  /** Makes a root provider's store the one the facade reaches while the provider is mounted. */
  register: (store: T) => void;
  /** The store a facade method forwards to: the most recently mounted root's, or none on the server. */
  target: (method: string) => T | undefined;
}

/**
 * The stores of the mounted root providers, in mounting order, for a module-level facade: it forwards
 * to the last, and back to the one before when that unmounts. On the server it reaches none.
 */
export function createFacadeRegistry<T>(facade: string): FacadeRegistry<T> {
  const mounted: T[] = [];
  return {
    register(store) {
      if (isServer || !getOwner()) return;
      mounted.push(store);
      onCleanup(() => {
        const index = mounted.lastIndexOf(store);
        if (index > -1) mounted.splice(index, 1);
      });
    },
    target(method) {
      if (isServer) {
        warn(`${facade}.${method}() does nothing on the server; it works in the browser only.`);
        return undefined;
      }
      const store = mounted.at(-1);
      if (!store) warn(`${facade}.${method}() was called with no <SlopkitUi> mounted.`);
      return store;
    },
  };
}
