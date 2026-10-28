import { render as renderBare } from '@solidjs/testing-library';
import type { JSX } from '@solidjs/web';
import { captureArtifact } from '@solidjs/diagnostics';
import { createStore, flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import {
  AngleSlider,
  Autocomplete,
  Checkbox,
  Chip,
  ColorInput,
  ColorPicker,
  FileInput,
  JsonInput,
  MultiSelect,
  NativeSelect,
  NumberInput,
  PasswordInput,
  PinInput,
  Radio,
  RangeSlider,
  Rating,
  SegmentedControl,
  Select,
  Slider,
  SlopkitUi,
  Switch,
  TagsInput,
  Textarea,
  TextInput,
} from '@solid-slopkit/components';
import {
  DateInput,
  DatePickerInput,
  DateTimePicker,
  MonthPickerInput,
  TimeInput,
  TimePicker,
  YearPickerInput,
} from '@solid-slopkit/components/dates';
import { bind, form } from './index';

// Every ui input, bound the way guides/binding.md says. The spreads are inline, as in an app: typecheck proves each
// field type fits, and the render proves the binding reads nothing untracked.
const render = (ui: () => JSX.Element) => renderBare(ui, { wrapper: (props) => <SlopkitUi>{props.children}</SlopkitUi> });

const model = () => ({
  text: 'a',
  choice: 'a',
  optional: 'a' as string | null,
  list: ['a'] as string[],
  number: 1,
  maybeNumber: 1 as number | undefined,
  range: [1, 5] as [number, number],
  on: false,
  file: null as File | null,
  files: [] as File[],
  date: null as Date | null,
  dates: [] as Date[],
  dateRange: [null, null] as [Date | null, Date | null],
});

type Model = ReturnType<typeof model>;
type Fields = ReturnType<typeof form<Model>>;

const inputs: [string, (f: Fields) => JSX.Element][] = [
  ['TextInput', (f) => <TextInput label="x" {...bind.text(f.text)} />],
  ['Textarea', (f) => <Textarea label="x" {...bind.text(f.text)} />],
  ['PasswordInput', (f) => <PasswordInput label="x" {...bind.text(f.text)} />],
  ['Autocomplete', (f) => <Autocomplete label="x" data={['a']} {...bind(f.text)} />],
  ['JsonInput', (f) => <JsonInput label="x" {...bind(f.text)} />],
  ['PinInput', (f) => <PinInput {...bind(f.text)} />],
  ['ColorInput', (f) => <ColorInput label="x" {...bind(f.text)} />],
  ['ColorPicker', (f) => <ColorPicker {...bind(f.text)} />],
  ['NumberInput', (f) => <NumberInput label="x" {...bind(f.maybeNumber)} />],
  ['Slider', (f) => <Slider {...bind(f.number)} />],
  ['AngleSlider', (f) => <AngleSlider {...bind(f.number)} />],
  ['Rating', (f) => <Rating {...bind(f.number)} />],
  ['RangeSlider', (f) => <RangeSlider {...bind(f.range)} />],
  ['Select', (f) => <Select label="x" data={['a', 'b']} {...bind(f.optional)} />],
  ['NativeSelect', (f) => <NativeSelect label="x" data={['a', 'b']} {...bind.nativeSelect(f.choice)} />],
  ['SegmentedControl', (f) => <SegmentedControl data={['a', 'b']} {...bind(f.choice)} />],
  [
    'Radio.Group',
    (f) => (
      <Radio.Group label="x" {...bind(f.choice)}>
        <Radio value="a" label="a" />
      </Radio.Group>
    ),
  ],
  [
    'Chip.Group',
    (f) => (
      <Chip.Group {...bind(f.choice)}>
        <Chip value="a">a</Chip>
      </Chip.Group>
    ),
  ],
  [
    'Chip.Group multiple',
    (f) => (
      <Chip.Group multiple {...bind(f.list)}>
        <Chip value="a">a</Chip>
      </Chip.Group>
    ),
  ],
  ['MultiSelect', (f) => <MultiSelect label="x" data={['a', 'b']} {...bind(f.list)} />],
  ['TagsInput', (f) => <TagsInput label="x" {...bind(f.list)} />],
  [
    'Checkbox.Group',
    (f) => (
      <Checkbox.Group label="x" {...bind(f.list)}>
        <Checkbox value="a" label="a" />
      </Checkbox.Group>
    ),
  ],
  [
    'Switch.Group',
    (f) => (
      <Switch.Group label="x" {...bind(f.list)}>
        <Switch value="a" label="a" />
      </Switch.Group>
    ),
  ],
  ['Checkbox', (f) => <Checkbox label="x" {...bind.checked(f.on)} />],
  ['Switch', (f) => <Switch label="x" {...bind.checked(f.on)} />],
  ['Chip', (f) => <Chip {...bind.checked(f.on)}>x</Chip>],
  ['FileInput', (f) => <FileInput label="x" {...bind(f.file)} />],
  ['FileInput multiple', (f) => <FileInput multiple label="x" {...bind(f.files)} />],
  ['DateInput', (f) => <DateInput label="x" {...bind(f.date)} />],
  ['DateTimePicker', (f) => <DateTimePicker label="x" {...bind(f.date)} />],
  ['DatePickerInput', (f) => <DatePickerInput label="x" {...bind(f.date)} />],
  ['DatePickerInput multiple', (f) => <DatePickerInput type="multiple" label="x" {...bind(f.dates)} />],
  ['DatePickerInput range', (f) => <DatePickerInput type="range" label="x" {...bind(f.dateRange)} />],
  ['MonthPickerInput', (f) => <MonthPickerInput label="x" {...bind(f.date)} />],
  ['YearPickerInput', (f) => <YearPickerInput label="x" {...bind(f.date)} />],
  ['TimeInput', (f) => <TimeInput label="x" {...bind(f.text)} />],
  ['TimePicker', (f) => <TimePicker label="x" {...bind(f.text)} />],
];

describe('every ui input takes its binding', () => {
  test.each(inputs)('%s', async (_, input) => {
    const [state, setState] = createStore(model());
    const { artifact } = await captureArtifact(
      () => {
        render(() => input(form(state, setState)));
        flush();
      },
      { scenario: 'bind-input' },
    );
    expect(artifact).toHaveNoDiagnostics();
  });
});
