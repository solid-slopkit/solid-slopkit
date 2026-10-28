import { createMemo, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useSlopkitUi } from '../components/provider/slopkit-ui';
import { resolveStyleClass, type AllStyleProps, type StyleGroup } from './style-props';

/**
 * The generated classes for a component's style props, as one string. All groups resolve in one memo: each
 * instance pays for one computation, and a change in one group re-resolves the others from the cache. Boxes
 * with the same declarations share a class, and the provider adds its CSS once. Returns a string, so the
 * class only updates when the result changes.
 */
export function createStyleClasses(
  props: AllStyleProps,
  groups: readonly StyleGroup[],
  component: string,
): Accessor<string | undefined> {
  const { registerStyle } = useSlopkitUi(component);

  return createMemo(
    () => {
      let result: string | undefined;
      for (const group of groups) {
        const styleClass = resolveStyleClass(props, group);
        if (styleClass === undefined) continue;
        registerStyle(styleClass.className, styleClass.css);
        result = result ? `${result} ${styleClass.className}` : styleClass.className;
      }
      return result;
    },
    { name: `${component}.styleClasses` },
  );
}

/**
 * Joins classes into one string. A string class is applied in one write; an array is normalized and applied
 * entry by entry, which costs more per element. Only a user `class` that is an array or object needs the
 * array form.
 */
export function joinClass(classes: (string | undefined)[], userClass: JSX.ClassValue | JSX.RemoveAttribute): JSX.ClassValue {
  if (userClass && typeof userClass !== 'string') return [...classes, userClass];
  let result = '';
  for (const value of classes) if (value) result += result ? ` ${value}` : value;
  return userClass ? `${result} ${userClass}` : result;
}
