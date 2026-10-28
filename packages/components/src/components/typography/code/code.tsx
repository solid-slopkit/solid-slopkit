import { omit, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './code.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export interface CodeOwnProps {
  /** Renders a `pre` block that keeps line breaks and scrolls sideways, instead of inline `code`. */
  block?: boolean;
}

export type CodeProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, CodeOwnProps>;

/** Code in a monospace font: inline `code`, or a `pre` block with `block`. */
export function Code(props: CodeProps) {
  // `block` picks the element once, like `as` on other components.
  if (!untrack(() => props.block)) {
    const others = omit(props, 'class', 'block');
    // oxlint-disable-next-line solid/components-return-once -- the branch is decided once, untracked, above
    return <code class={joinClass(['slp-code', style.code], props.class)} {...others} />;
  }

  // A block can scroll, so it takes a tab stop: browsers in the baseline don't all let the keyboard reach a scroller.
  const mergedProps = mergeDefaultProps({ tabindex: 0 }, props);
  const others = omit(mergedProps, 'class', 'children', 'block');

  return (
    <pre
      data-block=""
      class={joinClass(['slp-code', style.code], mergedProps.class)}
      {...(others as JSX.HTMLAttributes<HTMLPreElement>)}
    >
      <code data-slot="code-content">{mergedProps.children}</code>
    </pre>
  );
}
