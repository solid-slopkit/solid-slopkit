import { createContext, createSignal, createUniqueId, flush, omit, untrack, useContext, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './collapse.module.css';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

/** The indicator at the end of the title: a chevron that turns, or a plus that becomes a minus. */
export type CollapseIcon = 'arrow' | 'plus';

export interface CollapseOwnProps {
  /** Whether the content is shown, for a controlled collapse. */
  opened?: boolean;
  /** Whether it starts open, for an uncontrolled one. Read once. */
  defaultOpened?: boolean;
  /** Called when Collapse.Title is pressed, with the state it asks for. */
  onChange?: (opened: boolean) => void;
  /** An indicator at the end of the title. None by default. */
  icon?: CollapseIcon;
}

export type CollapseProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, CollapseOwnProps>;
export type CollapseTitleProps = ElementProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
// The id is the one Collapse.Title's aria-controls points at.
export type CollapseContentProps = Omit<ElementProps<JSX.HTMLAttributes<HTMLDivElement>>, 'id'>;

interface CollapseContextValue {
  opened: Accessor<boolean>;
  toggle: () => void;
  contentId: string;
  icon: () => CollapseIcon | undefined;
}

const CollapseContext = createContext<CollapseContextValue | null>(null);

function useCollapse(component: string): CollapseContextValue {
  const context = useContext(CollapseContext);
  if (!context) throw new Error(`<${component}> must be used inside <Collapse>.`);
  return context;
}

/** The button that shows and hides the content, with `aria-expanded` and `aria-controls` set. */
export function CollapseTitle(props: CollapseTitleProps) {
  const context = useCollapse('Collapse.Title');
  const others = omit(props, 'class', 'onClick');

  return (
    <button
      type="button"
      aria-expanded={context.opened() ? 'true' : 'false'}
      aria-controls={context.contentId}
      data-opened={context.opened() ? '' : undefined}
      data-icon={context.icon()}
      class={joinClass(['slp-collapse-title', style.title], props.class)}
      onClick={(event: MouseEvent) => {
        callHandler(props.onClick, event);
        if (!event.defaultPrevented) context.toggle();
      }}
      {...others}
    />
  );
}

/**
 * The content, which grows from zero to its own height when opened and shrinks back when closed, in CSS. Closed, it
 * stays in the DOM with `visibility: hidden`: its content keeps its state, and is out of the tab order and the
 * accessibility tree.
 */
export function CollapseContent(props: CollapseContentProps) {
  const context = useCollapse('Collapse.Content');
  const others = omit(props, 'class', 'children');

  return (
    <div
      id={context.contentId}
      data-opened={context.opened() ? '' : undefined}
      class={joinClass(['slp-collapse-content', style.content], props.class)}
      {...others}
    >
      <div data-slot="collapse-content-body" class={style.body}>
        {props.children}
      </div>
    </div>
  );
}

/**
 * A title that shows and hides the content under it, built from Collapse.Title and Collapse.Content. The height
 * animates in CSS. Uncontrolled by default; pass `opened` and `onChange` to control it.
 */
export function Collapse(props: CollapseProps) {
  const others = omit(props, 'class', 'opened', 'defaultOpened', 'onChange', 'icon');
  const [own, setOwn] = createSignal(
    untrack(() => !!props.defaultOpened),
    { name: 'Collapse.opened' },
  );
  const opened = () => props.opened ?? own();
  const toggle = () => {
    const next = !opened();
    if (props.opened === undefined) setOwn(next);
    props.onChange?.(next);
    flush();
  };

  return (
    <CollapseContext value={{ opened, toggle, contentId: createUniqueId(), icon: () => props.icon }}>
      <div
        data-opened={opened() ? '' : undefined}
        data-icon={props.icon}
        class={joinClass(['slp-collapse', style.collapse], props.class)}
        {...others}
      />
    </CollapseContext>
  );
}

Collapse.Title = CollapseTitle;
Collapse.Content = CollapseContent;
