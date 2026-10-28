import { createSignal, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../../components/inputs/field';
import { Input, type InputOwnProps } from '../../components/inputs/input';
import { callHandler, type ElementProps } from '../../utils';

export interface TimeInputOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly' | 'ref'> {
  /** The time, for a controlled field: `HH:mm`, or `HH:mm:ss` with seconds; `''` for none. */
  value?: string;
  /** The time at first, for an uncontrolled one. Read once. Defaults to `''`. */
  defaultValue?: string;
  /** Called with the time when it changes: `HH:mm` (`HH:mm:ss` with seconds), or `''` while it's incomplete. */
  onChange?: (value: string) => void;
  /** Adds the seconds. */
  withSeconds?: boolean;
  /** The earliest time, `HH:mm` or `HH:mm:ss`. */
  minTime?: string;
  /** The latest time, `HH:mm` or `HH:mm:ss`. */
  maxTime?: string;
}

export type TimeInputProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'>,
  TimeInputOwnProps
>;

/**
 * A labelled field for a time of day: the browser's time input, in an Input's box. The browser writes the time by
 * the user's settings and offers its own picker; the value is always `HH:mm`, or `HH:mm:ss` with seconds.
 */
export function TimeInput(props: TimeInputProps) {
  const others = omit(
    controlProps(props) as TimeInputProps,
    'value',
    'defaultValue',
    'onChange',
    'withSeconds',
    'minTime',
    'maxTime',
    'onInput',
  );
  const [own, setOwn] = createSignal(
    untrack(() => props.defaultValue ?? ''),
    { name: 'TimeInput.value' },
  );
  const value = () => props.value ?? own();

  return (
    <FieldWrapper field={props} rootClass="slp-time-input">
      <Input
        {...(others as Record<string, unknown>)}
        type="time"
        // Seconds show with a step under a minute.
        step={props.withSeconds ? 1 : 60}
        min={props.minTime}
        max={props.maxTime}
        value={value()}
        onInput={(event: InputEvent) => {
          callHandler(props.onInput, event);
          const next = (event.currentTarget as HTMLInputElement).value;
          if (next === value()) return;
          if (props.value === undefined) setOwn(next);
          props.onChange?.(next);
        }}
      />
    </FieldWrapper>
  );
}
