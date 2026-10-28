# Stepper

Progress through steps, such as a form split into parts: the steps in order with the current one marked, and the current step's content under them.

```tsx
import { Stepper } from '@solid-slopkit/components';
```

## Usage

```tsx
const [active, setActive] = createSignal(0);

<Stepper active={active()} onStepClick={setActive}>
  <Stepper.Step label="Account" description="Create an account">
    <AccountForm />
  </Stepper.Step>
  <Stepper.Step label="Address" description="Where to ship">
    <AddressForm />
  </Stepper.Step>
  <Stepper.Step label="Payment" icon={<CreditCard />}>
    <PaymentForm />
  </Stepper.Step>
  <Stepper.Completed>Your order is on its way.</Stepper.Completed>
</Stepper>
<Button onClick={() => setActive((step) => step + 1)}>Next</Button>
```

- **Parts:** `Stepper.Step`s in order, and optionally one `Stepper.Completed`, directly inside `Stepper`. They render nothing on their own; the Stepper draws the steps and shows the content.
- **Active:** `active` is the current step's index, from 0, and it's yours: the Stepper doesn't change it. The steps before it are completed, the ones after it upcoming. At the step count (one past the last), every step is completed and `Stepper.Completed`'s content shows.
- **Steps:** an `ol`, each step an `li` with a circle (its number; a check mark once completed, or `completedIcon`; `icon` replaces the number; `loading` shows a Loader), a `label` and a `description`, then a line to the next step that takes the color once the step is completed. The current step has `aria-current="step"`; a completed one adds "Completed" (`completedLabel`) for screen readers. The circle is hidden from them.
- **Content:** a step's children show under the steps while it's the current one, and only then: switching steps renders the new step's content, so a form's state lives in your signals, not in the fields.
- **Clicking:** with `onStepClick`, the steps are buttons that call it with their index. All of them by default; `allowNextStepsSelect={false}` leaves the steps after the current one plain, and a step's `allowStepSelect` wins over both.
- **Look:** `color` is the current and completed steps' color role (default `primary`); a step's own `color` overrides it for that step and the line after it. `size` from `xs` to `xl` (default `md`) sizes the circles and the text. `orientation="vertical"` stacks the steps in a column with the lines running down.
- Other props go to the root `div`.

## Props

| Prop                   | Type                                   | Default        | Description                                      |
| ---------------------- | -------------------------------------- | -------------- | ------------------------------------------------ |
| `active`               | `number`                               | —              | The current step's index. Required.              |
| `onStepClick`          | `(index: number) => void`              | —              | Makes the steps buttons.                         |
| `allowNextStepsSelect` | `boolean`                              | `true`         | Lets the steps after the current one be clicked. |
| `color`                | `SlopColor`                            | `'primary'`    | The current and completed steps' color role.     |
| `size`                 | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`         | The circles and the text.                        |
| `orientation`          | `'horizontal' \| 'vertical'`           | `'horizontal'` | Steps in a row, or a column.                     |
| `completedLabel`       | `string`                               | `'Completed'`  | Read out after a completed step's label.         |

Stepper.Step: `label`, `description`, `icon`, `completedIcon`, `loading`, `color`, `allowStepSelect`, and `children` (its content). Stepper.Completed: `children`.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-stepper`, with `data-orientation`, `data-color`, `data-size`, and `data-completed` past the last step. Each step: `.slp-stepper-step` (`[data-slot="stepper-step"]`), with `data-state` (`completed`, `current` or `upcoming`), `data-color` and `data-last`.
- Slots: `stepper-steps` (the `ol`), `stepper-step-control` (the button, or a `div`), `stepper-step-icon`, `stepper-step-number`, `stepper-step-body`, `stepper-step-label`, `stepper-step-description`, `stepper-separator`, `stepper-content`.
- Custom properties, on the stepper, a step, or an ancestor: `--slp-stepper-color`, `--slp-stepper-content` (the check mark on a completed step).
