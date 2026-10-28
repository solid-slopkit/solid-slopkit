import { Title } from '@solidjs/meta';
import { CodeBlock } from '../../components/CodeBlock';
import { DocTable } from '../../components/DocTable';
import { Example } from '../../components/Example';
import { H2 } from '../../components/Heading';

import Binding from '../../examples/signal-forms/binding';
import bindingCode from '../../examples/signal-forms/binding.tsx?raw';
import Native from '../../examples/signal-forms/native';
import nativeCode from '../../examples/signal-forms/native.tsx?raw';

const PROPS: [string, string][] = [
  ['value / checked', "The field's value, as a getter. bind.checked() gives checked instead of value."],
  [
    'onChange(value)',
    'Writes the typed value to the field. bind.text() gives onInput instead, and bind.nativeSelect() an onChange that takes the change event; both read the element.',
  ],
  ['onBlur()', 'Marks the field touched.'],
  ['error', "The first error's message (true if it has none) once the field is touched; false before."],
  ['disabled', "The field's $disabled(), including from a container above."],
  ['readOnly', "The field's $readonly()."],
  ['required', 'True when a required() rule is attached.'],
];

const TYPES: [string, string, string][] = [
  ['TextInput, Textarea, PasswordInput', 'bind.text(f.x)', 'string'],
  ['Autocomplete, JsonInput, PinInput, ColorInput, ColorPicker, TimeInput, TimePicker', 'bind(f.x)', 'string'],
  ['Select', 'bind(f.x)', 'string | null'],
  ['NativeSelect', 'bind.nativeSelect(f.x)', 'string'],
  ['SegmentedControl, Radio.Group, Chip.Group', 'bind(f.x)', 'string'],
  ['MultiSelect, TagsInput, Checkbox.Group, Switch.Group, Chip.Group multiple', 'bind(f.x)', 'string[]'],
  ['NumberInput', 'bind(f.x)', 'number | undefined'],
  ['Slider, AngleSlider, Rating', 'bind(f.x)', 'number'],
  ['RangeSlider', 'bind(f.x)', '[number, number]'],
  ['Checkbox, Switch, Chip', 'bind.checked(f.x)', 'boolean'],
  ['FileInput (multiple)', 'bind(f.x)', 'File | null (File[])'],
  ['DateInput, DateTimePicker, DatePickerInput, MonthPickerInput, YearPickerInput', 'bind(f.x)', 'Date | null'],
  ['The picker inputs with type="multiple"', 'bind(f.x)', 'Date[]'],
  ['The picker inputs with type="range"', 'bind(f.x)', '[Date | null, Date | null]'],
];

const CONTROLS: [string, string, string][] = [
  ['control(f.x)', 'text input', 'string'],
  ['control.number(f.x)', 'number input', 'number (NaN when empty)'],
  ['control.checkbox(f.x)', 'checkbox', 'boolean'],
  ['control.select(f.x)', 'select', 'string'],
];

export default function FormsBinding() {
  return (
    <article class="docs-page">
      <Title>Binding · Signal forms · slopkit</Title>
      <p class="docs-eyebrow">Signal forms</p>
      <h1>Binding</h1>
      <p class="docs-lead">
        Connect a field to an input: <code>bind()</code> for slopkit components, <code>control()</code> for native elements.
      </p>
      <CodeBlock code={`import { bind, control } from '@solid-slopkit/signal-forms';`} />

      <H2 id="bind">bind(): components</H2>
      <p>
        <code>bind(f.plan)</code> returns the props a slopkit input takes: a typed <code>value</code> and{' '}
        <code>onChange(value)</code>, plus the field's error and conditions. Spread it, and put the label and the rest around it.
        Every prop is a getter, so the input follows the field. Three variants cover the other inputs: <code>bind.text()</code>{' '}
        for the text inputs, which pass <code>value</code> and <code>onInput</code> to their native element,{' '}
        <code>bind.checked()</code> for <code>Checkbox</code>, <code>Switch</code> and <code>Chip</code>, and{' '}
        <code>bind.nativeSelect()</code> for <code>NativeSelect</code>, whose <code>onChange</code> is the native event.
      </p>
      <Example component={Binding} code={bindingCode} column />
      <DocTable head={['Prop', 'Value']} rows={PROPS.map(([prop, value]) => [<code>{prop}</code>, value])} />

      <H2 id="types">Match the field's type to the component</H2>
      <p>
        The field's type must be the type the component reports. A mismatch is a type error, not a silent conversion. A{' '}
        <code>NumberInput</code> reports <code>undefined</code> when it's empty, so model it as <code>number | undefined</code>;{' '}
        <code>min()</code> and <code>max()</code> skip an empty value, so pair them with <code>required()</code>. For a themed
        dropdown, use <code>Select</code> with <code>bind()</code>; <code>NativeSelect</code> is the browser's own select.
      </p>
      <DocTable
        head={['Component', 'Call', 'Field type']}
        rows={TYPES.map(([component, call, type]) => [component, <code>{call}</code>, <code>{type}</code>])}
      />

      <H2 id="override">Overriding a prop</H2>
      <p>
        Props after the spread win. To show errors before a field is touched, or to render your own message, pass{' '}
        <code>error</code> yourself:
      </p>
      <CodeBlock code={`<TextInput {...bind.text(f.name)} error={f.name.$errors()[0]?.message} />`} />

      <H2 id="control">control(): native elements</H2>
      <p>
        For a plain <code>&lt;input&gt;</code> or <code>&lt;select&gt;</code>, <code>control()</code> spreads a value and DOM
        event handlers. It reflects <code>$disabled()</code> and <code>$readonly()</code> onto the element; checkboxes and selects
        have no native <code>readonly</code>, so their handlers refuse the edit and snap the element back.
      </p>
      <Example component={Native} code={nativeCode} column />
      <DocTable
        head={['Call', 'Element', 'Field type']}
        rows={CONTROLS.map(([call, element, type]) => [<code>{call}</code>, element, type])}
      />
    </article>
  );
}
