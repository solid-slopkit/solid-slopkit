import { createMemo, omit, Show } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './fieldset.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export type FieldsetVariant = 'outline' | 'soft' | 'ghost';

export interface FieldsetOwnProps {
  /** The group's caption: a `legend`, which names the group for screen readers. */
  legend?: JSX.Element;
  /** Visual style. Defaults to `outline`. */
  variant?: FieldsetVariant;
  /** Disables every control inside, natively. */
  disabled?: boolean;
}

export type FieldsetProps = ElementProps<JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>, FieldsetOwnProps>;

const hasContent = (value: JSX.Element) => value != null && value !== false;

/** A group of related fields: a `fieldset`, with its `legend` as a caption inside the box. */
export function Fieldset(props: FieldsetProps) {
  const others = omit(props, 'class', 'children', 'legend', 'variant', 'disabled');
  // Read once: a JSX prop is a getter that creates its elements on every read.
  const legend = createMemo(() => props.legend, { name: 'Fieldset.legend' });

  return (
    <fieldset
      disabled={props.disabled}
      data-variant={props.variant ?? 'outline'}
      data-disabled={props.disabled ? '' : undefined}
      class={joinClass(['slp-fieldset', style.fieldset], props.class)}
      {...others}
    >
      <Show when={hasContent(legend())}>
        <legend data-slot="fieldset-legend" class={style.legend}>
          {legend()}
        </legend>
      </Show>
      {props.children}
    </fieldset>
  );
}
