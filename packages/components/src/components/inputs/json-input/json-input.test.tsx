import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { JsonInput } from './json-input';

const type = (el: HTMLElement, text: string) => {
  (el as HTMLTextAreaElement).value = text;
  fireEvent.input(el);
  flush();
};
const blur = (el: HTMLElement) => {
  fireEvent.blur(el);
  flush();
};

describe('<JsonInput />', () => {
  test('a labelled textarea, without spellcheck, in a field with its own class', () => {
    const { getByRole, container } = render(() => <JsonInput label="Config" class="mine" />);
    const control = getByRole('textbox', { name: 'Config' });

    expect(control.tagName).toBe('TEXTAREA');
    expect(control).toHaveAttribute('spellcheck', 'false');
    expect(container.firstElementChild).toHaveClass('slp-json-input', 'slp-textarea', 'mine');
  });

  test('leaving invalid JSON shows the error; fixing it clears the error while typing', () => {
    const { getByRole } = render(() => <JsonInput label="Config" />);
    const control = getByRole('textbox');

    type(control, '{"a": ');
    expect(control).not.toHaveAttribute('aria-invalid');
    blur(control);
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription('Invalid JSON');

    type(control, '{"a": 1}');
    expect(control).not.toHaveAttribute('aria-invalid');
  });

  test('empty text is valid', () => {
    const { getByRole } = render(() => <JsonInput label="Config" />);
    const control = getByRole('textbox');

    blur(control);

    expect(control).not.toHaveAttribute('aria-invalid');
  });

  test('formatOnBlur formats valid JSON and reports the formatted text', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => <JsonInput label="Config" formatOnBlur indent={4} onChange={onChange} />);
    const control = getByRole('textbox') as HTMLTextAreaElement;

    type(control, '{"a":[1,2]}');
    blur(control);

    expect(control.value).toBe('{\n    "a": [\n        1,\n        2\n    ]\n}');
    expect(onChange).toHaveBeenLastCalledWith(control.value);
  });

  test('controlled: it shows value; an error of yours wins; validationError renames the message', () => {
    const [value, setValue] = createSignal('[1]');
    const { getAllByRole } = render(() => (
      <>
        <JsonInput label="One" value={value()} onChange={setValue} validationError="Not JSON." />
        <JsonInput label="Two" defaultValue="nope" error="Server says no." />
      </>
    ));
    const [one, two] = getAllByRole('textbox') as HTMLTextAreaElement[];

    type(one, '[1, 2');
    expect(untrack(value)).toBe('[1, 2');
    blur(one);
    expect(one).toHaveAccessibleDescription('Not JSON.');

    blur(two);
    expect(two).toHaveAccessibleDescription('Server says no.');
  });

  test('deserialize and serialize replace JSON', () => {
    const { getByRole } = render(() => (
      <JsonInput
        label="Numbers"
        formatOnBlur
        deserialize={(text) => {
          if (!/^[\d,\s]*$/.test(text)) throw new Error('digits only');
          return text.split(',').map((part) => part.trim());
        }}
        serialize={(parts) => (parts as string[]).join(', ')}
      />
    ));
    const control = getByRole('textbox') as HTMLTextAreaElement;

    type(control, '1,2 ,3');
    blur(control);
    expect(control.value).toBe('1, 2, 3');

    type(control, '1,x');
    blur(control);
    expect(control).toHaveAttribute('aria-invalid', 'true');
  });

  test('leaving with invalid JSON updates it without diagnostics or waste', async () => {
    const { getByRole } = render(() => <JsonInput label="Config" defaultValue="{" />);
    flush();
    const control = getByRole('textbox');

    const { artifact } = await captureArtifact(() => blur(control), { scenario: 'json-input-blur' });

    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(12);
  });

  test('has no axe violations', async () => {
    const { container, getAllByRole } = render(() => (
      <>
        <JsonInput label="Config" defaultValue={'{"theme": "dark"}'} />
        <JsonInput label="Broken" defaultValue="{" />
      </>
    ));
    blur(getAllByRole('textbox')[1]);

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./json-input.fixtures.tsx', 'jsonInputs');
  });
});
