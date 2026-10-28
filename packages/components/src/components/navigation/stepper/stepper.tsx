import { children, createMemo, For, omit, Show, untrack } from 'solid-js';
import { dynamic, type JSX } from '@solidjs/web';
import style from './stepper.module.css';
import { Loader } from '../../feedback/loader';
import { VisuallyHidden } from '../../typography/visually-hidden';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepperOwnProps {
  /** The current step's index, from 0. The step count (one past the last) shows Stepper.Completed. */
  active: number;
  /** Makes the steps buttons that call this with their index. */
  onStepClick?: (index: number) => void;
  /** Lets the steps after the current one be clicked too. Defaults to `true`. */
  allowNextStepsSelect?: boolean;
  /** The color role of the current and completed steps. Defaults to `primary`. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** Steps in a row, or a column. Defaults to `horizontal`. */
  orientation?: StepperOrientation;
  /** Read out after a completed step's label. Defaults to `Completed`. */
  completedLabel?: string;
}

export type StepperProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, StepperOwnProps>;

export interface StepperStepProps {
  /** The step's name. */
  label?: JSX.Element;
  /** A line under the label. */
  description?: JSX.Element;
  /** Replaces the step's number in its circle. */
  icon?: JSX.Element;
  /** Replaces the check mark once the step is completed. */
  completedIcon?: JSX.Element;
  /** Shows a loader in the circle. */
  loading?: boolean;
  /** Its own color role, for the circle and the line after it. */
  color?: SlopColor;
  /** Whether it can be clicked, with `onStepClick`. Defaults to the Stepper's rule. */
  allowStepSelect?: boolean;
  /** Shown under the steps while it's the current one. */
  children?: JSX.Element;
}

export interface StepperCompletedProps {
  /** Shown under the steps once every step is done. */
  children?: JSX.Element;
}

const STEP = Symbol('Stepper.Step');
const COMPLETED = Symbol('Stepper.Completed');

interface StepDescriptor {
  [STEP]: true;
  props: StepperStepProps;
}

interface CompletedDescriptor {
  [COMPLETED]: true;
  props: StepperCompletedProps;
}

const isStep = (value: unknown): value is StepDescriptor => typeof value === 'object' && value !== null && STEP in value;
const isCompleted = (value: unknown): value is CompletedDescriptor =>
  typeof value === 'object' && value !== null && COMPLETED in value;

/**
 * One step: its circle, label and description in the row of steps, and its content under them while it's the
 * current one. It renders nothing by itself; the Stepper around it does.
 */
export function StepperStep(props: StepperStepProps): JSX.Element {
  return { [STEP]: true, props } satisfies StepDescriptor as unknown as JSX.Element;
}

/** What shows under the steps once `active` is past the last step. */
export function StepperCompleted(props: StepperCompletedProps): JSX.Element {
  return { [COMPLETED]: true, props } satisfies CompletedDescriptor as unknown as JSX.Element;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

interface StepItemProps {
  step: StepperStepProps;
  index: number;
  last: boolean;
  stepper: StepperProps;
}

function StepItem(props: StepItemProps) {
  // The step's props object stays the same for the item's life: For keys the items by it.
  const step = untrack(() => props.step);
  const state = () =>
    props.index < props.stepper.active ? 'completed' : props.index === props.stepper.active ? 'current' : 'upcoming';
  const clickable = () =>
    !!props.stepper.onStepClick &&
    (step.allowStepSelect ?? (props.index <= props.stepper.active || (props.stepper.allowNextStepsSelect ?? true)));
  const Control = dynamic(() => (clickable() ? 'button' : 'div'));

  // A JSX prop creates its elements each time it's read, so each is read only where it's rendered.
  const has = untrack(() => ({
    label: 'label' in step,
    description: 'description' in step,
    icon: 'icon' in step,
    completedIcon: 'completedIcon' in step,
  }));

  return (
    <li
      data-state={state()}
      data-color={step.color}
      data-last={props.last ? '' : undefined}
      data-slot="stepper-step"
      class={joinClass(['slp-stepper-step', style.step], undefined)}
    >
      <Control
        type={clickable() ? 'button' : undefined}
        aria-current={state() === 'current' ? 'step' : undefined}
        data-slot="stepper-step-control"
        class={style.control}
        onClick={clickable() ? () => props.stepper.onStepClick?.(props.index) : undefined}
      >
        <span data-slot="stepper-step-icon" aria-hidden="true" class={style.icon}>
          <Show when={!step.loading} fallback={<Loader size="xs" />}>
            <Show
              when={state() === 'completed'}
              fallback={has.icon ? step.icon : <span data-slot="stepper-step-number">{props.index + 1}</span>}
            >
              {has.completedIcon ? step.completedIcon : <CheckIcon />}
            </Show>
          </Show>
        </span>
        <span data-slot="stepper-step-body" class={style.body}>
          {has.label && (
            <span data-slot="stepper-step-label" class={style.label}>
              {step.label}
            </span>
          )}
          <Show when={state() === 'completed'}>
            <VisuallyHidden>{`, ${props.stepper.completedLabel ?? 'Completed'}`}</VisuallyHidden>
          </Show>
          {has.description && (
            <span data-slot="stepper-step-description" class={style.description}>
              {step.description}
            </span>
          )}
        </span>
      </Control>
      <Show when={!props.last}>
        <span data-slot="stepper-separator" aria-hidden="true" class={style.separator} />
      </Show>
    </li>
  );
}

/**
 * Progress through steps, such as a form split in parts: an ordered list of Stepper.Steps with the current one marked,
 * and the current step's content under it. `active` says which step is current; past the last step, Stepper.Completed
 * shows. With `onStepClick` the steps are buttons.
 */
export function Stepper(props: StepperProps) {
  const others = omit(
    props,
    'class',
    'children',
    'active',
    'onStepClick',
    'allowNextStepsSelect',
    'color',
    'size',
    'orientation',
    'completedLabel',
  );

  const resolved = children(() => props.children);
  const parts = createMemo(() => resolved.toArray(), { name: 'Stepper.parts' });
  const steps = createMemo(
    () =>
      parts()
        .filter(isStep)
        .map((step) => step.props),
    { name: 'Stepper.steps' },
  );
  const completed = createMemo(() => parts().find(isCompleted)?.props, { name: 'Stepper.completed' });

  // What shows under the steps: the current step's content, or the completed content past the last step.
  const content = createMemo(
    () => {
      const index = props.active;
      const list = steps();
      return index >= 0 && index < list.length ? list[index] : index >= list.length ? completed() : undefined;
    },
    { name: 'Stepper.content' },
  );

  return (
    <div
      data-orientation={props.orientation ?? 'horizontal'}
      data-color={props.color ?? 'primary'}
      data-size={props.size ?? 'md'}
      data-completed={props.active >= steps().length ? '' : undefined}
      class={joinClass(['slp-stepper', style.stepper], props.class)}
      {...others}
    >
      <ol data-slot="stepper-steps" class={style.steps}>
        <For each={steps()}>
          {(step, index) => <StepItem step={step} index={index()} last={index() === steps().length - 1} stepper={props} />}
        </For>
      </ol>
      <div data-slot="stepper-content" class={style.content}>
        {content()?.children}
      </div>
    </div>
  );
}

Stepper.Step = StepperStep;
Stepper.Completed = StepperCompleted;
