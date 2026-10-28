import { createMemo, omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { useLocale } from '../../provider';

export interface NumberFormatterOwnProps {
  /** The number to show. `null` or `undefined` shows nothing. */
  value: number | bigint | null | undefined;
  /** `Intl.NumberFormat` options: `style`, `currency`, `maximumFractionDigits`, `notation`, `unit`, … */
  options?: Intl.NumberFormatOptions;
  /** A locale for this number only. Defaults to the provider's. */
  locale?: string;
  /** Text before the formatted number. */
  prefix?: string;
  /** Text after the formatted number. */
  suffix?: string;
}

export type NumberFormatterProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, NumberFormatterOwnProps>;

/** A number formatted for the reader's locale with `Intl.NumberFormat`: a `span` with the text. */
export function NumberFormatter(props: NumberFormatterProps) {
  const providerLocale = useLocale();
  const others = omit(props, 'class', 'value', 'options', 'locale', 'prefix', 'suffix');

  // One formatter per locale and options; a new value only formats again.
  const formatter = createMemo(() => new Intl.NumberFormat(props.locale ?? providerLocale(), props.options), {
    name: 'NumberFormatter.formatter',
  });
  const text = createMemo(
    () => (props.value == null ? '' : `${props.prefix ?? ''}${formatter().format(props.value)}${props.suffix ?? ''}`),
    { name: 'NumberFormatter.text' },
  );

  return (
    <span class={joinClass(['slp-number-formatter'], props.class)} {...others}>
      {text()}
    </span>
  );
}
