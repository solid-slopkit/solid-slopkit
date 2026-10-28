# Primitives

The behavior the components are built from, with no markup or look of their own: closing overlays, positioning them, moving focus, animating in and out, locking the page's scroll, and keyboard navigation. Use them to build a component the library doesn't have, so it behaves like the ones it does.

```tsx
import {
  createDismissal,
  createFloating,
  createFocusScope,
  createListNavigation,
  createPresence,
  createScrollLock,
  createTypeahead,
  getTabbables,
} from '@solid-slopkit/components/primitives';
```

## Conventions

- Call them in a component (or another owner): they create effects and clean up with their owner.
- Options are functions, read reactively, or at each key press for the keyboard ones. Pass signals and accessors as they are (`open: opened`), and constants as `() => 8`.
- Elements are passed as accessors too, so plain `let` variables set by a ref callback work: they are read when the overlay opens or an option changes.
- Nothing touches the DOM on the server; the overlays start closed or open without animating, which is also what the server renders.
- The keyboard ones keep no state and know no elements. They tell you where to go (`onMove`, `onMatch`), and you focus it, select it or make it the active descendant. They handle a key only without Alt, Ctrl or Meta, skip an event that is already `defaultPrevented`, and prevent the keys they handle.
- Their types are exported too: `PresenceOptions`, `Presence`, `PresenceStatus`; `FloatingOptions`, `Floating`, `FloatingPlacement`, `FloatingSide`; `DismissalOptions`, `DismissReason`; `FocusScopeOptions`; `ScrollLockOptions`; `ListNavigationOptions`, `ListNavigation`, `ListNavigationOrientation`; `TypeaheadOptions`, `Typeahead`.

## An overlay, put together

A panel in the top layer under its button: animated in and out, positioned, closed by Escape or a press outside, with focus moved in and back.

```tsx
import { createEffect, createSignal, type JSX } from 'solid-js';
import { createDismissal, createFloating, createFocusScope, createPresence } from '@solid-slopkit/components/primitives';

function Details(props: { label: string; children: JSX.Element }) {
  const [open, setOpen] = createSignal(false, { name: 'Details.open' });
  let button: HTMLButtonElement | undefined;
  let panel: HTMLDivElement | undefined;

  const presence = createPresence({ present: open, element: () => panel });
  const floating = createFloating({
    reference: () => button,
    floating: () => panel,
    open: presence.mounted,
    placement: () => 'bottom-start',
    offset: () => 8,
  });
  createDismissal('Details', { open, elements: () => [button, panel], onDismiss: () => setOpen(false) });
  createFocusScope({ open: () => open() && presence.mounted(), element: () => panel, restoreTarget: () => button });

  // In the top layer while mounted, so the exit animation plays before it leaves.
  createEffect(presence.mounted, (mounted) => {
    if (mounted) {
      panel!.showPopover();
      floating.update();
    } else if (panel!.matches(':popover-open')) panel!.hidePopover();
  });

  return (
    <>
      <button ref={(el) => (button = el)} aria-expanded={open() ? 'true' : 'false'} onClick={() => setOpen(!open())}>
        {props.label}
      </button>
      <div
        ref={(el) => (panel = el)}
        popover="manual"
        role="dialog"
        aria-label={props.label}
        tabindex={-1}
        class="details"
        data-status={presence.status()}
        data-placement={floating.placement()}
      >
        {props.children}
      </div>
    </>
  );
}
```

```css
.details {
  transition:
    opacity 150ms,
    translate 150ms;
}
.details:is([data-status='starting'], [data-status='ending']) {
  opacity: 0;
  translate: 0 -4px;
}
```

## createPresence

Enter and exit animations for an element that is shown and hidden, including a popover or `<dialog>` in the top layer. `createPresence({ present, element, onEntered?, onExited? })` returns `{ mounted, status }`.

- `mounted()` is true from the moment `present()` turns true until the exit animations have finished. Render the content, or keep the element in the top layer, while it's true.
- `status()` is `closed`, `starting` (one frame after it's shown, so transitions start from these styles), `open`, or `ending` (exit animations running). Render it as `data-status` and write the CSS against it.
- CSS decides what moves: it waits for the element's own finite transitions and animations, and its pseudo-elements' such as `::backdrop`. With none (or none under `prefers-reduced-motion`), it closes before the next paint and opens a frame later. Turning back while leaving reverses from where it is.
- `onEntered` runs when the enter animations finish, `onExited` when the exit ones do and it's no longer mounted.

## createFloating

Positions an element against an anchor with `@floating-ui/dom`, and keeps it there while open: through scrolling, resizing, and either element changing size. `createFloating(options)` returns `{ placement, update }`.

| Option         | Default  | Description                                                                                                     |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `reference`    | required | The anchor: an element, or anything with `getBoundingClientRect`, such as a point under the cursor.             |
| `floating`     | required | The element to position. Expected in the top layer: a shown popover or `<dialog>`.                              |
| `open`         | required | Whether it's shown. It's positioned and follows the anchor only while true; pass `presence.mounted`.            |
| `placement`    | `bottom` | `top`, `right`, `bottom` or `left`, optionally with `-start` or `-end` to line up the starting or ending edges. |
| `offset`       | `0`      | The gap between the anchor and the element, in px.                                                              |
| `flip`         | `true`   | Moves to the opposite side when there's no room.                                                                |
| `shift`        | `true`   | Slides along its side to stay in the viewport.                                                                  |
| `padding`      | `8`      | How close to the viewport's edges flipping and shifting let it come, in px.                                     |
| `sameWidth`    | `false`  | Sets its width to the anchor's.                                                                                 |
| `arrow`        |          | An arrow element inside it, kept pointing at the anchor's center (its `left` or `top` is set).                  |
| `arrowPadding` | `0`      | How close the arrow may come to the corners, in px.                                                             |

- It writes `position`, `top`, `left` and `margin` inline (overriding a popover's centering), and hides the element with `visibility` while the anchor is scrolled out of view.
- `placement()` is where it actually went after flipping. Render it as `data-placement`, to put the arrow on the right edge and animate from the anchor's side.
- `update()` positions it again now: call it right after showing the element. Scrolling, resizing and the anchor moving are followed without it.

## createDismissal

Closing an overlay with Escape or a press outside it, in the right order when overlays are nested. Needs a `<SlopkitUi>` above it; the first argument names your component in the error when there is none.

```tsx
createDismissal('Details', {
  open,
  elements: () => [button, panel],
  onDismiss: (reason, event) => setOpen(false), // reason: 'escape' | 'outside'
  closeOnEscape: () => true, // default
  closeOnClickOutside: () => true, // default
});
```

- While open, it's in the provider's order of overlays, on top of those already open, shared with the library's own overlays. Escape goes to the topmost one only. A press closes, from the top down, every overlay it's outside of, until one it's inside of or one that doesn't close on outside presses.
- `elements` are what a press doesn't close it from, usually the overlay and its anchor. Render a nested overlay inside its parent's element, so a press in the child counts as inside the parent.
- A touch closes on its click rather than its pointerdown, so scrolling the page doesn't.
- The topmost overlay prevents Escape's default even when it stays open, so a `<dialog>` doesn't close on its own. A modal that ignores Escape should still prevent its `cancel` event.

## createFocusScope

Focus for an overlay: moved in when it opens, back when it closes, and optionally kept inside.

| Option          | Default  | Description                                                                                                                                    |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`          | required | Whether the scope is active. Pass `() => open() && presence.mounted()`, so it's rendered when focus moves in.                                  |
| `element`       | required | The element focus is kept in. It's focused itself when it has nothing tabbable, so give it `tabindex="-1"`.                                    |
| `autoFocus`     | `true`   | Moves focus in on open: to the element with `data-autofocus`, else the first tabbable one, else the container. Off when you focus it yourself. |
| `restoreFocus`  | `true`   | Moves focus back on close (or unmount while open) to where it was before opening.                                                              |
| `restoreTarget` |          | Where focus goes back to when nothing had it before opening, usually the anchor.                                                               |
| `trap`          | `false`  | Tab and Shift+Tab wrap around inside, and focus that lands outside is brought back. A modal `<dialog>` contains focus on its own.              |

- Focus moves in after the update that opened it, so an element shown by an effect of that update is already focusable.
- Focus goes back only while it's inside the scope or nowhere: closing because the user clicked into another field leaves it there.
- Nested scopes work when the child renders inside the parent: the innermost trap handles Tab first.

`getTabbables(container)` returns the elements Tab stops on inside it, in document order: focusable, not disabled, not `tabindex="-1"`, rendered and not inert. Of a group of radios, only the checked one (or the first) counts. Positive `tabindex` values aren't reordered.

## createScrollLock

`createScrollLock({ locked })` keeps the page from scrolling while `locked()` is true, as a modal does: the root gets `overflow: hidden`, and a classic scrollbar's room is kept as padding so the page doesn't shift sideways. Locks add up across the page, the library's own included: it scrolls again when the last comes off, and the root's own inline styles come back. Elements that scroll by themselves still do.

## createListNavigation

Arrow-key movement through a list, for one-tab-stop widgets (a toolbar, a listbox, tabs): the arrows move to the previous or next enabled item, Home and End to the first and last. Left to right only; there is no right-to-left support.

```tsx
const navigation = createListNavigation({
  orientation: () => 'horizontal', // 'horizontal' (Left/Right), 'vertical' (Up/Down) or 'both'
  count: () => items().length,
  current: () => active(), // -1 when there is none
  isDisabled: (index) => items()[index].disabled,
  loop: () => true, // default: past the last goes to the first
  onMove: (index, event) => setActive(index),
});

<div role="toolbar" onKeyDown={navigation.onKeyDown}>
  …
</div>;
```

From no current item, the next arrow goes to the first enabled item and the previous to the last.

## createTypeahead

Jumping to an item by typing the start of its label, for menus and listboxes. `createTypeahead(options)` returns `{ onKeyDown, reset }`.

```tsx
const typeahead = createTypeahead({
  count: () => options().length,
  current: () => active(),
  getLabel: (index) => options()[index].label,
  isDisabled: (index) => options()[index].disabled,
  timeout: () => 500, // default: the pause that starts a new search, in ms
  onMatch: (index, event) => setActive(index),
});
```

- Characters typed in quick succession build one search ("new" goes past "Nebraska" to "New York"), and the current item stays while it still matches. Typing the same character again cycles through the items starting with it.
- Space counts only inside a search, so on its own it still activates the item. Matching ignores case and leading spaces.
- It handles only single printable characters, so put it next to the list navigation: `onKeyDown={(event) => { typeahead.onKeyDown(event); navigation.onKeyDown(event); }}`.
- Call `reset()` when the list closes, to forget what was typed.
