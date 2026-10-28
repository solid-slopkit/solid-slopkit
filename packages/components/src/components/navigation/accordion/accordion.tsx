import { createContext, createProjection, createSignal, createUniqueId, flush, omit, untrack, useContext } from 'solid-js';
import { dynamic, type JSX } from '@solidjs/web';
import style from './accordion.module.css';
import { createListNavigation } from '../../primitives';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export type AccordionVariant = 'divided' | 'bordered' | 'separated';

export type AccordionChevronPosition = 'left' | 'right';

/** The heading level of the controls' headings. */
export type AccordionOrder = 2 | 3 | 4 | 5 | 6;

interface AccordionSharedProps {
  /** Defaults to `divided`. */
  variant?: AccordionVariant;
  /** The heading level each control sits in, to fit the page's outline. Defaults to 3. */
  order?: AccordionOrder;
  /** Which side of the control the chevron is on. Defaults to `right`. */
  chevronPosition?: AccordionChevronPosition;
  /** Replaces the chevron, which turns as an item opens unless `disableChevronRotation`. */
  chevron?: JSX.Element;
  /** Keeps the chevron as it is when an item opens. */
  disableChevronRotation?: boolean;
  /** Whether the arrows go from the last control to the first, and back. Defaults to `true`. */
  loop?: boolean;
}

interface AccordionSingleProps {
  /** Lets several items be open at once. Read once. */
  multiple?: false;
  /** The open item's value, for a controlled accordion; `null` for none. */
  value?: string | null;
  /** The item open at first, for an uncontrolled one. Read once. */
  defaultValue?: string | null;
  /** Called with the open item's value, or `null` when it closes. */
  onChange?: (value: string | null) => void;
}

interface AccordionMultipleProps {
  multiple: true;
  /** The open items' values, for a controlled accordion. */
  value?: readonly string[];
  /** The items open at first, for an uncontrolled one. Read once. */
  defaultValue?: readonly string[];
  /** Called with the open items' values. */
  onChange?: (value: string[]) => void;
}

export type AccordionOwnProps = AccordionSharedProps & (AccordionSingleProps | AccordionMultipleProps);

export type AccordionProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, AccordionOwnProps>;

export interface AccordionItemOwnProps {
  /** Names the item: what `value` holds while it's open. */
  value: string;
}

export type AccordionItemProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, AccordionItemOwnProps>;

export interface AccordionControlOwnProps {
  /** Content before the label, usually an icon. */
  icon?: JSX.Element;
  /** Keeps the item as it is. */
  disabled?: boolean;
}

export type AccordionControlProps = ElementProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>, AccordionControlOwnProps>;

export type AccordionPanelProps = Omit<ElementProps<JSX.HTMLAttributes<HTMLDivElement>>, 'id'>;

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  controlId: (value: string) => string;
  panelId: (value: string) => string;
  order: () => AccordionOrder;
  chevronPosition: () => AccordionChevronPosition;
  /** Whether a custom chevron was passed; reading `chevron` creates one, so it's read only where it's rendered. */
  hasChevron: boolean;
  chevron: () => JSX.Element;
  disableChevronRotation: () => boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<{ value: () => string } | null>(null);

function useAccordion(component: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Accordion>.`);
  return context;
}

function useAccordionItem(component: string) {
  const item = useContext(AccordionItemContext);
  if (!item) throw new Error(`<${component}> must be rendered inside <Accordion.Item>.`);
  return item;
}

// A value can hold any character; an id can't hold whitespace.
const idPart = (value: string) => value.replace(/[^\w-]/g, (char) => `_${char.codePointAt(0)!.toString(16)}`);

/** One section: a control and the panel it shows and hides. */
export function AccordionItem(props: AccordionItemProps) {
  const context = useAccordion('Accordion.Item');
  const others = omit(props, 'class', 'value');
  const opened = () => context.isOpen(props.value);

  return (
    <AccordionItemContext value={{ value: () => props.value }}>
      <div
        data-value={props.value}
        data-opened={opened() ? '' : undefined}
        data-slot="accordion-item"
        class={joinClass(['slp-accordion-item', style.item], props.class)}
        {...others}
      />
    </AccordionItemContext>
  );
}

/**
 * The item's heading: a `button` in a heading of the Accordion's `order`, with `aria-expanded` and `aria-controls`.
 */
export function AccordionControl(props: AccordionControlProps) {
  const context = useAccordion('Accordion.Control');
  const item = useAccordionItem('Accordion.Control');
  const others = omit(props, 'class', 'children', 'icon', 'disabled', 'onClick');
  const opened = () => context.isOpen(item.value());
  const hasIcon = untrack(() => 'icon' in props);
  const Heading = dynamic(() => `h${context.order()}` as const);

  return (
    <Heading data-slot="accordion-heading" class={style.heading}>
      <button
        type="button"
        id={context.controlId(item.value())}
        aria-expanded={opened() ? 'true' : 'false'}
        aria-controls={context.panelId(item.value())}
        disabled={props.disabled}
        data-opened={opened() ? '' : undefined}
        data-disabled={props.disabled ? '' : undefined}
        data-chevron-position={context.chevronPosition()}
        data-rotate={context.disableChevronRotation() ? undefined : ''}
        data-slot="accordion-control"
        class={joinClass(['slp-accordion-control', style.control], props.class)}
        onClick={(event: MouseEvent) => {
          callHandler(props.onClick, event);
          if (!event.defaultPrevented && !props.disabled) context.toggle(item.value());
        }}
        {...others}
      >
        <span data-slot="accordion-chevron" aria-hidden="true" class={style.chevron}>
          {context.hasChevron ? context.chevron() : <span class={style.defaultChevron} />}
        </span>
        {hasIcon && (
          <span data-slot="accordion-icon" aria-hidden="true" class={style.icon}>
            {props.icon}
          </span>
        )}
        <span data-slot="accordion-label" class={style.label}>
          {props.children}
        </span>
      </button>
    </Heading>
  );
}

/**
 * The item's content: a `region` labelled by its control, which grows from zero to its height when the item opens.
 * Closed, it stays in the DOM with `visibility: hidden`, out of the tab order and the accessibility tree.
 */
export function AccordionPanel(props: AccordionPanelProps) {
  const context = useAccordion('Accordion.Panel');
  const item = useAccordionItem('Accordion.Panel');
  const others = omit(props, 'class', 'children');
  const opened = () => context.isOpen(item.value());

  return (
    <div
      id={context.panelId(item.value())}
      role="region"
      aria-labelledby={context.controlId(item.value())}
      data-opened={opened() ? '' : undefined}
      data-slot="accordion-panel"
      class={joinClass(['slp-accordion-panel', style.panel], props.class)}
      {...others}
    >
      <div data-slot="accordion-panel-body" class={style.body}>
        {props.children}
      </div>
    </div>
  );
}

/**
 * Sections whose content shows and hides under their headings: Accordion.Items, each with an Accordion.Control and
 * an Accordion.Panel. One item is open at a time, or several with `multiple`. The arrows move between the controls.
 */
export function Accordion(props: AccordionProps) {
  const others = omit(
    props as AccordionSharedProps & AccordionSingleProps & JSX.HTMLAttributes<HTMLDivElement>,
    'class',
    'multiple',
    'value',
    'defaultValue',
    'onChange',
    'variant',
    'order',
    'chevronPosition',
    'chevron',
    'disableChevronRotation',
    'loop',
    'onKeyDown',
  );
  const multiple = untrack(() => !!props.multiple);
  const baseId = `slp-accordion-${createUniqueId()}`;
  let root: HTMLDivElement | undefined;

  const toList = (value: string | null | readonly string[] | undefined): readonly string[] =>
    value == null ? [] : typeof value === 'string' ? [value] : value;

  const [own, setOwn] = createSignal<readonly string[]>(
    untrack(() => toList(props.defaultValue)),
    { name: 'Accordion.value' },
  );
  const values = () => (props.value !== undefined ? toList(props.value) : own());

  // The open values as a set of keys: a change re-runs only the items that open or close.
  let previous: readonly string[] = [];
  const open = createProjection<Record<string, true>>(
    (draft) => {
      const next = values();
      for (const value of previous) if (!next.includes(value)) delete draft[value];
      for (const value of next) draft[value] = true;
      previous = next;
    },
    {},
    { name: 'Accordion.open' },
  );

  const toggle = (value: string) => {
    const current = values();
    const opened = current.includes(value);
    const next = multiple ? (opened ? current.filter((other) => other !== value) : [...current, value]) : opened ? [] : [value];
    if (props.value === undefined) setOwn(next);
    if (multiple) (props.onChange as ((value: string[]) => void) | undefined)?.(next);
    else (props.onChange as ((value: string | null) => void) | undefined)?.(next[0] ?? null);
    flush();
  };

  // The controls in order: those of this accordion, not of one nested in a panel.
  const controls = () =>
    [...(root?.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-control"]') ?? [])].filter(
      (control) => control.closest('[data-slot="accordion"]') === root,
    );

  const navigation = createListNavigation({
    orientation: () => 'vertical',
    count: () => controls().length,
    current: () => controls().indexOf(document.activeElement as HTMLButtonElement),
    isDisabled: (index) => controls()[index]?.disabled ?? true,
    loop: () => props.loop ?? true,
    onMove: (index) => controls()[index]?.focus(),
  });

  const context: AccordionContextValue = {
    isOpen: (value) => open[value] === true,
    toggle,
    controlId: (value) => `${baseId}-control-${idPart(value)}`,
    panelId: (value) => `${baseId}-panel-${idPart(value)}`,
    order: () => props.order ?? 3,
    chevronPosition: () => props.chevronPosition ?? 'right',
    hasChevron: untrack(() => 'chevron' in props),
    chevron: () => props.chevron,
    disableChevronRotation: () => !!props.disableChevronRotation,
  };

  return (
    <AccordionContext value={context}>
      <div
        ref={(element: HTMLDivElement) => (root = element)}
        data-variant={props.variant ?? 'divided'}
        data-slot="accordion"
        class={joinClass(['slp-accordion', style.accordion], props.class)}
        onKeyDown={(event: KeyboardEvent) => {
          callHandler(props.onKeyDown, event);
          // Only on this accordion's own controls, not in a panel's content.
          const control = (event.target as Element).closest('[data-slot="accordion-control"]');
          if (control && control.closest('[data-slot="accordion"]') === root) navigation.onKeyDown(event);
        }}
        {...others}
      />
    </AccordionContext>
  );
}

Accordion.Item = AccordionItem;
Accordion.Control = AccordionControl;
Accordion.Panel = AccordionPanel;
