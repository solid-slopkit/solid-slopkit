# NumberFormatter

A number formatted for the reader's locale with `Intl.NumberFormat`: a `span` with the text.

```tsx
import { NumberFormatter } from '@solid-slopkit/components';
```

## Usage

```tsx
<NumberFormatter value={1234567.891} />                                  // 1,234,567.891
<NumberFormatter value={9.5} options={{ style: 'currency', currency: 'EUR' }} />  // €9.50
<NumberFormatter value={0.256} options={{ style: 'percent' }} />         // 26%
<NumberFormatter value={1500000} options={{ notation: 'compact' }} />    // 1.5M
```

- **Locale:** the nearest `<SlopkitUi>`'s `locale` (`en-US` by default), so a whole app, or a part of it, switches together. It follows a change of the provider's locale. `locale` on the formatter overrides it for one number. It must be inside a `<SlopkitUi>`.
- **Options:** `options` goes to `Intl.NumberFormat` as it is: `style` (`decimal`, `currency`, `percent`, `unit`), `currency`, `unit`, `minimumFractionDigits`, `maximumFractionDigits`, `notation` (`compact`, `scientific`), `signDisplay`, `useGrouping`, and the rest.
- **Value:** a `number` or a `bigint`. `null` or `undefined` shows nothing, for a value that hasn't loaded.
- **Prefix and suffix:** plain text before and after the formatted number, for what `Intl` doesn't produce, such as `suffix=" done"`. A currency or a unit should go through `options`, so it's placed and spaced for the locale.
- **Server rendering:** the locale comes from the provider, never the runtime, so the server and the browser format alike and hydration matches.
- The span has no styles of its own. Put it in a Text, a Title or a table cell.

## Props

Other props are passed to the `span`.

| Prop      | Type                                    | Default        | Description                       |
| --------- | --------------------------------------- | -------------- | --------------------------------- |
| `value`   | `number \| bigint \| null \| undefined` | —              | The number to show. Required.     |
| `options` | `Intl.NumberFormatOptions`              | —              | Options for `Intl.NumberFormat`.  |
| `locale`  | `string`                                | the provider's | A locale for this number only.    |
| `prefix`  | `string`                                | —              | Text before the formatted number. |
| `suffix`  | `string`                                | —              | Text after the formatted number.  |

## Styling

- Root class: `.slp-number-formatter`. No slots, and no styles of its own.
