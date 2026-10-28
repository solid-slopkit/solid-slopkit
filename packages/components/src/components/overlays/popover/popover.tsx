import {
  createContext,
  createSignal,
  createUniqueId,
  flush,
  omit,
  onCleanup,
  onSettled,
  Show,
  untrack,
  useContext,
  type Accessor,
} from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './popover.module.css';
import {
  createDismissal,
  createFloating,
  createFocusScope,
  createPresence,
  type Floating,
  type FloatingPlacement,
  type Presence,
} from '../../primitives';
import { transitionAttributes, type TransitionName } from '../../utilities/transition/transition-attributes';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

/** A side of the target, optionally followed by an alignment along it: `bottom`, `bottom-start`, `right-end`, …. */
export type PopoverPosition = FloatingPlacement;

export interface PopoverProps {
  /** Whether the dropdown is open, for a controlled popover. */
  opened?: boolean;
  /** Whether it starts open, for an uncontrolled one. Read once. */
  defaultOpened?: boolean;
  /** Called when the popover opens or closes itself: the target is pressed, or it's dismissed. */
  onChange?: (opened: boolean) => void;
  /** Where the dropdown goes against the target. Defaults to `bottom`. It flips when there's no room. */
  position?: PopoverPosition;
  /** Gap between the target and the dropdown, in px. Defaults to 8. */
  offset?: number;
  /** Shows an arrow pointing at the target. */
  withArrow?: boolean;
  /** Makes the dropdown as wide as the target. */
  matchTargetWidth?: boolean;
  /** Whether Escape closes it. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Whether a press outside the target and the dropdown closes it. Defaults to `true`. */
  closeOnClickOutside?: boolean;
  /** Keeps Tab inside the dropdown while it's open. Defaults to `false`. */
  trapFocus?: boolean;
  /** Moves focus back to the target when it closes. Defaults to `true`. */
  returnFocus?: boolean;
  /** The dropdown's enter and exit animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Duration of the animation, in milliseconds. Defaults to 150. */
  transitionDuration?: number;
  /** Popover.Target and Popover.Dropdown. */
  children?: JSX.Element;
}

interface PopoverContextValue {
  opened: Accessor<boolean>;
  toggle: () => void;
  presence: Presence;
  floating: Floating;
  dropdownId: string;
  withArrow: () => boolean;
  transition: () => TransitionName;
  transitionDuration: () => number;
  setTarget: (element: HTMLElement | undefined) => void;
  setDropdown: (element: HTMLElement | undefined) => void;
  setArrow: (element: HTMLElement | undefined) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover(component: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Popover>.`);
  return context;
}

/** What the target spreads on its element: `<Button {...target}>`. */
export interface PopoverTargetAttributes {
  ref: (element: HTMLElement) => void;
  onClick: (event: MouseEvent) => void;
  'aria-haspopup': 'dialog';
  'aria-expanded': 'true' | 'false';
  'aria-controls': string | undefined;
}

export interface PopoverTargetProps {
  /** Renders the element that opens the popover. Spread the attributes on it; it must take a ref. */
  children: (target: PopoverTargetAttributes) => JSX.Element;
}

/** The element that toggles the popover and that the dropdown is positioned against, usually a button. */
export function PopoverTarget(props: PopoverTargetProps) {
  const context = usePopover('Popover.Target');
  const attributes: PopoverTargetAttributes = {
    ref: (element) => context.setTarget(element),
    onClick: () => context.toggle(),
    'aria-haspopup': 'dialog',
    get 'aria-expanded'() {
      return context.opened() ? 'true' : 'false';
    },
    // Only while the dropdown is in the DOM: a reference to a missing id is invalid.
    get 'aria-controls'() {
      return context.presence.mounted() ? context.dropdownId : undefined;
    },
  };
  // Called once, untracked: a signal the render function reads directly would otherwise rebuild the target, losing
  // focus. What changes goes in the attributes' getters and in the JSX's own expressions.
  return <>{untrack(() => props.children(attributes))}</>;
}

export type PopoverDropdownProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/**
 * The floating content: a non-modal dialog in the top layer, rendered while open. Name it with `aria-label` or
 * `aria-labelledby`.
 */
export function PopoverDropdown(props: PopoverDropdownProps) {
  const context = usePopover('Popover.Dropdown');
  return (
    <Show when={context.presence.mounted()}>
      <PopoverDropdownElement {...props} />
    </Show>
  );
}

function PopoverDropdownElement(props: PopoverDropdownProps) {
  const context = usePopover('Popover.Dropdown');
  const others = omit(props, 'ref', 'class', 'style', 'children');
  const animation = transitionAttributes(context.presence, {
    transition: context.transition,
    duration: context.transitionDuration,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });
  let element: HTMLDivElement | undefined;

  // In the top layer once it's in the document, then positioned at once rather than when it first resizes.
  onSettled(() => {
    element?.showPopover();
    context.floating.update();
  });
  onCleanup(() => {
    context.setDropdown(undefined);
    context.setArrow(undefined);
  });

  return (
    <div
      ref={[
        (el: HTMLDivElement) => {
          element = el;
          context.setDropdown(el);
        },
        untrack(() => props.ref),
      ]}
      id={context.dropdownId}
      popover="manual"
      role="dialog"
      tabindex={-1}
      data-slot="popover-dropdown"
      data-placement={context.floating.placement()}
      data-transition={animation['data-transition']}
      data-status={animation['data-status']}
      class={joinClass(['slp-popover', style.dropdown, animation.class], props.class)}
      style={{ ...animation.style, ...props.style }}
      {...others}
    >
      {props.children}
      <Show when={context.withArrow()}>
        <div data-slot="popover-arrow" class={style.arrow} ref={(el) => context.setArrow(el)} />
      </Show>
    </div>
  );
}

/**
 * Floating content anchored to a target, such as a small form or details, as a non-modal dialog in the top layer.
 * Build it from Popover.Target and Popover.Dropdown. The target toggles it; Escape and a press outside close it, the
 * innermost first when popovers are nested. Opening moves focus into the dropdown, and closing moves it back.
 */
export function Popover(props: PopoverProps) {
  const [own, setOwn] = createSignal(
    untrack(() => !!props.defaultOpened),
    { name: 'Popover.opened' },
  );
  const opened = () => props.opened ?? own();
  const setOpened = (next: boolean) => {
    if (next === opened()) return;
    if (props.opened === undefined) setOwn(next);
    props.onChange?.(next);
    flush();
  };

  let target: HTMLElement | undefined;
  let dropdown: HTMLElement | undefined;
  let arrow: HTMLElement | undefined;

  const presence = createPresence({ present: opened, element: () => dropdown });
  const floating = createFloating({
    reference: () => target,
    floating: () => dropdown,
    arrow: () => arrow,
    open: presence.mounted,
    placement: () => props.position ?? 'bottom',
    offset: () => props.offset ?? 8,
    sameWidth: () => !!props.matchTargetWidth,
    arrowPadding: () => 12,
  });
  createDismissal('Popover', {
    open: opened,
    elements: () => [target, dropdown],
    onDismiss: () => setOpened(false),
    closeOnEscape: () => props.closeOnEscape ?? true,
    closeOnClickOutside: () => props.closeOnClickOutside ?? true,
  });
  // Open and rendered: the dropdown is rendered while mounted, and leaving starts as soon as `opened` turns false.
  createFocusScope({
    open: () => opened() && presence.mounted(),
    element: () => dropdown,
    trap: () => !!props.trapFocus,
    restoreFocus: () => props.returnFocus ?? true,
    restoreTarget: () => target,
  });

  const context: PopoverContextValue = {
    opened,
    toggle: () => setOpened(!opened()),
    presence,
    floating,
    dropdownId: `slp-popover-${createUniqueId()}`,
    withArrow: () => !!props.withArrow,
    transition: () => props.transition ?? 'fade',
    transitionDuration: () => props.transitionDuration ?? 150,
    setTarget: (element) => (target = element),
    setDropdown: (element) => (dropdown = element),
    setArrow: (element) => (arrow = element),
  };

  return <PopoverContext value={context}>{props.children}</PopoverContext>;
}

Popover.Target = PopoverTarget;
Popover.Dropdown = PopoverDropdown;
