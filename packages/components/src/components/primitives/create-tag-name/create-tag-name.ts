import { type Accessor, type Component, createEffect, createSignal } from 'solid-js';
import { isString } from '../../../utils';

/**
 * Returns the tag name by parsing an element ref.
 * @example
 * function Component(props) {
 *   let ref: HTMLDivElement | undefined;
 *   const tagName = createTagName(() => ref, () => "button"); // div
 *   return <div ref={ref} {...props} />;
 * }
 */
export function createTagName(ref: Accessor<HTMLElement | undefined>, fallback?: Accessor<string | Component | undefined>) {
  const [tagName, setTagName] = createSignal(stringOrUndefined(fallback?.()));

  // The ref is only assigned once the element is created, so it is read in the effect phase
  // (after mount) rather than tracked in the compute phase, where it is still undefined.
  createEffect(
    () => fallback?.(),
    (value) => {
      setTagName(ref()?.tagName.toLowerCase() || stringOrUndefined(value));
    },
  );

  return tagName;
}

function stringOrUndefined(value: any) {
  return isString(value) ? value : undefined;
}
