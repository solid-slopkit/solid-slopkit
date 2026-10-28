import { createEffect, omit, onSettled, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { callHandler, mergeRefs, type ElementProps } from '../../../utils';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';
import style from './textarea.module.css';

export interface TextareaOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly' | 'ref'> {
  /** Grows and shrinks with the text, between `minRows` and `maxRows`. Read once. */
  autosize?: boolean;
  /** With `autosize`, the fewest rows it shrinks to. Defaults to 1. */
  minRows?: number;
  /** With `autosize`, the most rows it grows to; past that it scrolls. Without one, it grows without limit. */
  maxRows?: number;
}

export type TextareaProps = ElementProps<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, TextareaOwnProps>;

// Styles that decide how text wraps and how tall a textarea is: copied from the field to the measuring textarea.
const MEASURED = [
  'box-sizing',
  'width',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
  'line-height',
  'text-transform',
  'word-spacing',
  'text-indent',
  'tab-size',
  'white-space',
  'overflow-wrap',
  'word-break',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
] as const;

let measurer: HTMLTextAreaElement | undefined;

/**
 * The height, in px, a textarea needs to show `value` without scrolling, measured on one shared hidden textarea with
 * the same text styles and width, so the field itself never changes size while measuring.
 */
function contentHeight(el: HTMLTextAreaElement, value: string, rows: number): number {
  if (!measurer) {
    measurer = document.createElement('textarea');
    measurer.setAttribute('aria-hidden', 'true');
    measurer.tabIndex = -1;
    Object.assign(measurer.style, {
      position: 'absolute',
      top: '0',
      left: '-9999px',
      height: '0',
      minHeight: '0',
      maxHeight: 'none',
      overflow: 'hidden',
      visibility: 'hidden',
      pointerEvents: 'none',
    });
    document.body.append(measurer);
  }
  const css = getComputedStyle(el);
  for (const property of MEASURED) measurer.style.setProperty(property, css.getPropertyValue(property));
  measurer.value = value;
  const borders = parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth);
  const padding = parseFloat(css.paddingTop) + parseFloat(css.paddingBottom);
  const lineHeight = parseFloat(css.lineHeight);
  // At least `rows` lines: an empty field is as tall as its minimum.
  return Math.max(measurer.scrollHeight - padding, rows * lineHeight) + padding + borders;
}

/**
 * A labelled multi-line text field: an Input with a `textarea`, in an InputWrapper. With `autosize`, it grows and
 * shrinks with its text.
 */
export function Textarea(props: TextareaProps) {
  let el: HTMLTextAreaElement | undefined;
  const others = omit(controlProps(props), 'autosize', 'minRows', 'maxRows', 'ref', 'onInput');
  const autosize = untrack(() => !!props.autosize);

  const resize = () => {
    if (!el) return;
    const css = getComputedStyle(el);
    const lineHeight = parseFloat(css.lineHeight);
    const edges =
      parseFloat(css.paddingTop) +
      parseFloat(css.paddingBottom) +
      parseFloat(css.borderTopWidth) +
      parseFloat(css.borderBottomWidth);
    const minRows = props.minRows ?? 1;
    const maxHeight = props.maxRows ? props.maxRows * lineHeight + edges : Infinity;
    const needed = contentHeight(el, el.value, minRows);
    el.style.height = `${Math.min(needed, maxHeight)}px`;
    // Scrolls only once it's at its tallest.
    el.style.overflowY = needed > maxHeight ? 'auto' : 'hidden';
  };

  if (autosize) {
    // A new value from outside, or new bounds.
    createEffect(
      () => [props.value, props.minRows, props.maxRows],
      () => resize(),
      { name: 'Textarea.autosize' },
    );
    // A new width rewraps the text.
    onSettled(() => {
      resize();
      if (!el || typeof ResizeObserver === 'undefined') return;
      let width = el.offsetWidth;
      const observer = new ResizeObserver(() => {
        if (el && el.offsetWidth !== width) {
          width = el.offsetWidth;
          resize();
        }
      });
      observer.observe(el);
      return () => observer.disconnect();
    });
  }

  const onInput = (event: InputEvent) => {
    callHandler(props.onInput, event);
    if (autosize) resize();
  };

  return (
    <FieldWrapper field={props} rootClass={`slp-textarea ${style.textarea}`}>
      <Input
        {...(others as Record<string, unknown>)}
        as="textarea"
        // A ref is read once.
        ref={mergeRefs(
          (node: HTMLElement) => (el = node as HTMLTextAreaElement),
          untrack(() => props.ref),
        )}
        rows={autosize ? (props.minRows ?? 1) : props.rows}
        data-autosize={autosize ? '' : undefined}
        onInput={onInput}
      />
    </FieldWrapper>
  );
}
