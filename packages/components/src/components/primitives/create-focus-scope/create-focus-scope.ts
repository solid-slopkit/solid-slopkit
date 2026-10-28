import { createEffect, untrack } from 'solid-js';

const CANDIDATES = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/**
 * The elements inside `container` that Tab stops on, in document order: focusable, not disabled, not `tabindex="-1"`,
 * rendered and not inert. Of a group of radios, only the checked one counts, or the first when none is. Positive
 * `tabindex` values are not reordered.
 */
export function getTabbables(container: Element): HTMLElement[] {
  const result: HTMLElement[] = [];
  // The radio standing for each group so far.
  const radios: HTMLInputElement[] = [];
  for (const element of container.querySelectorAll<HTMLElement>(CANDIDATES)) {
    if (element.tabIndex < 0 || (element as HTMLButtonElement).disabled || element.closest('[inert]')) continue;
    if (!element.checkVisibility({ visibilityProperty: true })) continue;
    if (element instanceof HTMLInputElement && element.type === 'radio' && element.name) {
      const index = radios.findIndex((radio) => radio.name === element.name && radio.form === element.form);
      if (index === -1) {
        radios.push(element);
        result.push(element);
      } else if (element.checked && !radios[index].checked) {
        result.splice(result.indexOf(radios[index]), 1, element);
        radios[index] = element;
      }
      continue;
    }
    result.push(element);
  }
  return result;
}

export interface FocusScopeOptions {
  /** Whether the scope is active: focus moves in when it turns true, and back when it turns false. */
  open: () => boolean;
  /** The element focus is kept in. It's focused itself when it has nothing tabbable, so give it `tabindex="-1"`. */
  element: () => HTMLElement | undefined;
  /**
   * Whether opening moves focus in: to the element marked `data-autofocus`, else the first tabbable one, else the
   * container. Defaults to `true`. Turn it off when the component focuses something itself (a menu's item).
   */
  autoFocus?: () => boolean;
  /** Whether closing moves focus back to where it was before opening. Defaults to `true`. */
  restoreFocus?: () => boolean;
  /**
   * Where focus goes back to when nothing had it before opening, usually the anchor: some browsers don't focus a
   * button that is clicked.
   */
  restoreTarget?: () => HTMLElement | undefined;
  /**
   * Whether focus is contained: Tab and Shift+Tab wrap around inside, and focus that lands outside (a click, a
   * script) is brought back. Defaults to `false`. A modal `<dialog>` contains focus on its own.
   */
  trap?: () => boolean;
}

const focus = (element: HTMLElement | undefined) => element?.focus({ preventScroll: true });

/**
 * Focus for an overlay: moving it in when it opens, back when it closes, and, optionally, keeping it inside while it's
 * open. Nested scopes work because nested overlays render inside their parent: the innermost trap handles Tab first,
 * and focus moving into a child is still inside the parent.
 *
 * Closing and unmounting while open both move focus back. Focus moves in after the update that opened it has finished, so a popover or `<dialog>` shown by an effect of
 * that update is already focusable. Focus goes back only while it's inside the scope or nowhere: closing because the
 * user clicked into another field leaves it there.
 */
export function createFocusScope(options: FocusScopeOptions): void {
  createEffect(
    () => options.open(),
    (open) => {
      if (!open) return;
      const container = options.element();
      if (!container) return;
      const before = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      let active = true;

      if (options.autoFocus?.() ?? true) {
        queueMicrotask(() => {
          if (!active || container.contains(document.activeElement)) return;
          const marked = container.querySelector<HTMLElement>('[data-autofocus]');
          focus(marked ?? getTabbables(container)[0] ?? container);
        });
      }

      const trapping = () => options.trap?.() ?? false;
      // Last focused inside, to bring focus back to when it lands outside.
      let lastInside: HTMLElement | undefined;
      const bringBack = () =>
        focus(lastInside?.isConnected && container.contains(lastInside) ? lastInside : (getTabbables(container)[0] ?? container));
      const onFocusIn = (event: FocusEvent) => {
        if (!trapping()) return;
        const target = event.target as Node;
        if (container.contains(target)) lastInside = target instanceof HTMLElement ? target : undefined;
        else bringBack();
      };
      // Focus leaving for nowhere: a click on something that can't take focus, or the focused element removed. Not
      // when the window itself loses focus.
      const onFocusOut = (event: FocusEvent) => {
        if (!trapping() || event.relatedTarget) return;
        queueMicrotask(() => {
          const current = document.activeElement;
          if (active && trapping() && (!current || current === document.body) && document.hasFocus()) bringBack();
        });
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        if (!trapping()) return;
        const tabbables = getTabbables(container);
        const first = tabbables[0];
        const last = tabbables.at(-1);
        const current = document.activeElement;
        // Prevented in each case, so a trap around this one leaves it alone.
        if (!first || !last) {
          event.preventDefault();
          focus(container);
        } else if (event.shiftKey && (current === first || current === container)) {
          event.preventDefault();
          focus(last);
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          focus(first);
        }
      };
      document.addEventListener('focusin', onFocusIn);
      container.addEventListener('focusout', onFocusOut);
      container.addEventListener('keydown', onKeyDown);

      return () => {
        active = false;
        document.removeEventListener('focusin', onFocusIn);
        container.removeEventListener('focusout', onFocusOut);
        container.removeEventListener('keydown', onKeyDown);
        // Read as it closes, once: whether to restore is decided then.
        if (!(untrack(() => options.restoreFocus?.()) ?? true)) return;
        const current = document.activeElement;
        if (current && current !== document.body && !container.contains(current)) return;
        const target =
          before && before !== document.body && before.isConnected ? before : untrack(() => options.restoreTarget?.());
        // Untracked: the focus and blur handlers it runs, such as a tooltip's, read their own state.
        untrack(() => target?.focus());
      };
    },
    { name: 'focusScope.open' },
  );
}
