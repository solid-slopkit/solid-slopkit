# JsonInput

A labelled field for JSON: a [Textarea](../textarea/textarea.md) in a monospace font that checks the text when the field loses focus, shows an error while it's invalid, and can format it.

```tsx
import { JsonInput } from '@solid-slopkit/components';
```

## Usage

```tsx
const [config, setConfig] = createSignal('{"theme": "dark"}');

<JsonInput label="Config" value={config()} onChange={setConfig} formatOnBlur autosize minRows={4} />;
```

- **Value:** the text, a `string`. Controlled with `value` and `onChange` (passing `value` at all makes it controlled), or uncontrolled with `defaultValue`. `onChange` gets the text on every change, and the formatted text when the field formats it. Parse it yourself when you need the data.
- **Checking:** when the field loses focus, the text is parsed. If it isn't valid, the field shows `validationError` (`Invalid JSON`) as its error and is marked invalid; the error goes away as soon as the text is valid again, while typing. Empty text is valid. An `error` of yours is shown instead of the validation error.
- **Formatting:** with `formatOnBlur`, valid text is formatted when the field loses focus, `indent` spaces per level (2).
- **Other formats:** `deserialize` parses the text and throws when it's invalid (`JSON.parse` by default); `serialize` turns the value back into text when formatting (`JSON.stringify`).
- **Text:** a monospace font, no spellcheck, no autocapitalization, lines that don't wrap (the field scrolls sideways).
- **Everything else is Textarea's:** `autosize`, `minRows`, `maxRows`, `rows`, Input's `variant` and sections, and InputWrapper's `label`, `labelSection`, `description`, `required`, `withAsterisk`, `size`, `id`.

## Props

Other props are Textarea's, or go to the `textarea`.

| Prop              | Type                                         | Default          | Description                                        |
| ----------------- | -------------------------------------------- | ---------------- | -------------------------------------------------- |
| `value`           | `string`                                     | —                | The text, controlled.                              |
| `defaultValue`    | `string`                                     | `''`             | The starting text, uncontrolled.                   |
| `onChange`        | `(value: string) => void`                    | —                | Called with the text, and with the formatted text. |
| `formatOnBlur`    | `boolean`                                    | `false`          | Formats valid JSON when the field loses focus.     |
| `indent`          | `number`                                     | `2`              | Spaces per level when formatting.                  |
| `validationError` | `JSX.Element`                                | `'Invalid JSON'` | The message for invalid text.                      |
| `error`           | `JSX.Element`                                | —                | Your error, shown instead.                         |
| `deserialize`     | `(text: string) => unknown`                  | `JSON.parse`     | Parses the text; throws when invalid.              |
| `serialize`       | `(value: unknown, indent: number) => string` | `JSON.stringify` | Turns the value back into text.                    |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-json-input`, plus Textarea's `.slp-textarea` and `.slp-input-wrapper`.
- The textarea is the Input's `input-control` slot, with `data-invalid-json` while the text is invalid.
