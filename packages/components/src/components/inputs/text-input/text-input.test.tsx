import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { TextInput } from './text-input';

const Icon = () => <svg aria-hidden="true" data-testid="icon" viewBox="0 0 24 24" />;

describe('<TextInput />', () => {
  test('a labelled text input: wrapper props on the root, the rest on the input', () => {
    const { getByRole, container } = render(() => (
      <TextInput label="Name" placeholder="Your name" name="name" class="mine" style={{ width: '10rem' }} />
    ));
    const control = getByRole('textbox', { name: 'Name' });
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass('slp-text-input', 'slp-input-wrapper', 'mine');
    expect(root.style.width).toBe('10rem');
    expect(control).toHaveAttribute('placeholder', 'Your name');
    expect(control).toHaveAttribute('name', 'name');
    expect(control.closest('.slp-input')).toHaveAttribute('data-size', 'md');
    expect(control).not.toHaveAttribute('label');
  });

  test('description, error, required, size and id reach the input', () => {
    const { getByRole } = render(() => (
      <TextInput
        label="Email"
        description="We never share it."
        error="Enter a valid email."
        required
        size="lg"
        id="email"
        type="email"
      />
    ));
    const control = getByRole('textbox', { name: 'Email' });

    expect(control).toHaveAttribute('id', 'email');
    expect(control).toHaveAttribute('type', 'email');
    expect(control).toBeRequired();
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAccessibleDescription('We never share it. Enter a valid email.');
    expect(control.closest('.slp-input')).toHaveAttribute('data-size', 'lg');
  });

  test('Input props: variant, sections, disabled, readOnly and ref', () => {
    let ref: HTMLElement | undefined;
    const { getByRole, getByTestId } = render(() => (
      <TextInput label="Search" variant="soft" leftSection={<Icon />} disabled readOnly ref={(el: HTMLElement) => (ref = el)} />
    ));
    const control = getByRole('textbox') as HTMLInputElement;

    expect(ref).toBe(control);
    expect(control.closest('.slp-input')).toHaveAttribute('data-variant', 'soft');
    expect(control.closest('.slp-input')).toContainElement(getByTestId('icon'));
    expect(control).toBeDisabled();
    expect(control.readOnly).toBe(true);
  });

  test('controlled with value and onInput', () => {
    const [value, setValue] = createSignal('a');
    const { getByRole } = render(() => (
      <TextInput label="Name" value={value()} onInput={(event) => setValue(event.currentTarget.value)} />
    ));
    const control = getByRole('textbox') as HTMLInputElement;

    fireEvent.input(control, { target: { value: 'ab' } });
    flush();
    expect(untrack(value)).toBe('ab');

    setValue('reset');
    flush();
    expect(control.value).toBe('reset');
  });

  test('typing into a controlled field updates it without diagnostics or waste', async () => {
    const [value, setValue] = createSignal('', { name: 'value' });
    const { getByRole } = render(() => (
      <TextInput label="Name" value={value()} onInput={(event) => setValue(event.currentTarget.value)} />
    ));
    flush();
    const control = getByRole('textbox') as HTMLInputElement;

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.input(control, { target: { value: 'Ada' } });
        flush();
      },
      { scenario: 'text-input-type' },
    );

    expect(control.value).toBe('Ada');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <TextInput label="Name" placeholder="Your name" />
        <TextInput label="Email" description="We never share it." error="Enter a valid email." required type="email" />
        <TextInput label="Search" variant="soft" leftSection={<Icon />} />
        <TextInput label="Locked" disabled value="fixed" />
        <TextInput aria-label="No label" />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./text-input.fixtures.tsx', 'textInputs');
  });
});
