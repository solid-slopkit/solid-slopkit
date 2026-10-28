import { createMemo, omit, untrack } from 'solid-js';
import { type JSX, type ValidComponent } from '@solidjs/web';
import { Polymorphic, type PolymorphicProps } from '../../polymorphic';
import style from './text.module.css';
import { mergeDefaultProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextSize = SlopSize | '2xl' | '3xl' | '4xl' | '5xl';
export type TextAlign = 'start' | 'center' | 'end' | 'justify';
export type TextTransform = 'uppercase' | 'lowercase' | 'capitalize';

export interface TextOwnProps {
  /**
   * Font size and line height, from the `--slp-font-size-*` scale: `xs` to `xl` for copy, `2xl` to `5xl` for
   * display figures. Defaults to `md`. Ignored with `inherit`.
   */
  size?: TextSize;
  /** Text color, from a color role. Without one the text keeps the color it inherits. */
  color?: SlopColor;
  /** Mutes the text, for secondary copy. Works with or without `color`. */
  dimmed?: boolean;
  /** Font weight. Without one the weight is inherited. */
  weight?: TextWeight;
  /** `text-align`. Without one the alignment is inherited. */
  align?: TextAlign;
  /** Digits of equal width, so numbers line up in columns and don't shift as they change. */
  tabularNums?: boolean;
  /** Changes the case. `uppercase` also spaces the letters slightly, for labels. */
  transform?: TextTransform;
  /** Cuts the text to one line, with an ellipsis. Needs a block element, such as the default `p`. */
  truncate?: boolean;
  /** Cuts the text after this many lines, with an ellipsis. */
  lineClamp?: number;
  /** Takes font size and line height from the parent, e.g. Text inside a Title or a Button. */
  inherit?: boolean;
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
}

export type TextProps<T extends ValidComponent = 'p'> = PolymorphicProps<T, TextOwnProps>;

/** Body text: a paragraph by default, or any element with `as`. */
export function Text<T extends ValidComponent = 'p'>(props: TextProps<T>) {
  const mergedProps = mergeDefaultProps({ size: 'md' }, props as TextOwnProps & { as?: ValidComponent });

  // `as` and `dynamicAs` stay in: Polymorphic reads them.
  const others = omit(
    mergedProps,
    'class',
    'style',
    'size',
    'color',
    'dimmed',
    'weight',
    'align',
    'tabularNums',
    'transform',
    'truncate',
    'lineClamp',
    'inherit',
  );

  // The clamp count can be any number, so it goes in a custom property rather than a data-attribute selector.
  const styleValue = createMemo(
    () => {
      const lines = mergedProps.lineClamp;
      return lines ? { ...mergedProps.style, '--_text-line-clamp': String(lines) } : mergedProps.style;
    },
    { name: 'Text.style' },
  );

  // Without `as`, the element is a <p> rendered directly, so the compiler binds each attribute instead of going
  // through Polymorphic's spread. Read once, like `as` in Polymorphic.
  const isPolymorphic = untrack(
    () => (props as { as?: ValidComponent }).as !== undefined || !!(props as { dynamicAs?: boolean }).dynamicAs,
  );

  if (!isPolymorphic) {
    // oxlint-disable-next-line solid/components-return-once -- the branch is decided once, untracked, above
    return (
      <p
        data-size={mergedProps.inherit ? undefined : mergedProps.size}
        data-color={mergedProps.color}
        data-dimmed={mergedProps.dimmed ? '' : undefined}
        data-weight={mergedProps.weight}
        data-align={mergedProps.align}
        data-tabular-nums={mergedProps.tabularNums ? '' : undefined}
        data-transform={mergedProps.transform}
        data-truncate={mergedProps.truncate ? '' : undefined}
        data-line-clamp={mergedProps.lineClamp ? '' : undefined}
        data-inherit={mergedProps.inherit ? '' : undefined}
        class={joinClass(['slp-text', style.text], mergedProps.class)}
        style={styleValue()}
        {...(others as JSX.HTMLAttributes<HTMLParagraphElement>)}
      >
        {mergedProps.children}
      </p>
    );
  }

  return (
    <Polymorphic<Record<string, unknown>>
      as="p"
      data-size={mergedProps.inherit ? undefined : mergedProps.size}
      data-color={mergedProps.color}
      data-dimmed={mergedProps.dimmed ? '' : undefined}
      data-weight={mergedProps.weight}
      data-align={mergedProps.align}
      data-tabular-nums={mergedProps.tabularNums ? '' : undefined}
      data-transform={mergedProps.transform}
      data-truncate={mergedProps.truncate ? '' : undefined}
      data-line-clamp={mergedProps.lineClamp ? '' : undefined}
      data-inherit={mergedProps.inherit ? '' : undefined}
      class={joinClass(['slp-text', style.text], mergedProps.class)}
      style={styleValue()}
      {...others}
    >
      {mergedProps.children}
    </Polymorphic>
  );
}
