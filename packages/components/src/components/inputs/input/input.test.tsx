import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { InputWrapper } from '../input-wrapper';
import { Input, type InputVariant } from './input';

const Icon = () => <svg aria-hidden="true" data-testid="icon" viewBox="0 0 24 24" />;
const boxOf = (control: HTMLElement) => control.closest<HTMLElement>('.slp-input')!;

describe('<Input />', () => {
  test('a box around an input: class and style on the box, other props on the input', () => {
    const { getByRole } = render(() => (
      <Input aria-label="Name" placeholder="Your name" name="name" class="mine" style={{ width: '10rem' }} />
    ));
    const control = getByRole('textbox', { name: 'Name' });
    const box = boxOf(control);

    expect(control.tagName).toBe('INPUT');
    expect(control).toHaveAttribute('placeholder', 'Your name');
    expect(control).toHaveAttribute('name', 'name');
    expect(control).toHaveAttribute('data-slot', 'input-control');
    expect(control).not.toHaveClass('mine');
    expect(box).toHaveClass('slp-input', 'mine');
    expect(box.style.width).toBe('10rem');
    expect(box).toHaveAttribute('data-variant', 'outline');
    expect(box).toHaveAttribute('data-size', 'md');
    expect(control).not.toHaveAttribute('aria-invalid');
  });

  test('variant, size, invalid, disabled, readOnly and required', () => {
    const { getByRole } = render(() => <Input aria-label="Name" variant="soft" size="lg" invalid disabled readOnly required />);
    const control = getByRole('textbox') as HTMLInputElement;
    const box = boxOf(control);

    expect(box).toHaveAttribute('data-variant', 'soft');
    expect(box).toHaveAttribute('data-size', 'lg');
    expect(box).toHaveAttribute('data-invalid', '');
    expect(box).toHaveAttribute('data-disabled', '');
    expect(box).toHaveAttribute('data-read-only', '');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toBeDisabled();
    expect(control.readOnly).toBe(true);
    expect(control).toBeRequired();
  });

  test('sections get their slots and mark the box; the control stays between them', () => {
    const { getByRole, getByText } = render(() => (
      <Input aria-label="Price" leftSection={<Icon />} rightSection={<span>USD</span>} />
    ));
    const control = getByRole('textbox');
    const box = boxOf(control);
    const [left, , right] = Array.from(box.children);

    expect(left).toHaveAttribute('data-slot', 'input-left-section');
    expect(right).toHaveAttribute('data-slot', 'input-right-section');
    expect(right).toContainElement(getByText('USD'));
    expect(box).toHaveAttribute('data-with-left-section', '');
    expect(box).toHaveAttribute('data-with-right-section', '');
  });

  test('without sections, there are no section slots', () => {
    const { getByRole } = render(() => <Input aria-label="Name" />);
    const box = boxOf(getByRole('textbox'));

    expect(box.children).toHaveLength(1);
    expect(box).not.toHaveAttribute('data-with-left-section');
  });

  test('as renders another control; a textarea marks the box multiline', () => {
    const { getByRole } = render(() => <Input as="textarea" aria-label="Notes" rows={4} />);
    const control = getByRole('textbox');

    expect(control.tagName).toBe('TEXTAREA');
    expect(control).toHaveAttribute('rows', '4');
    expect(boxOf(control)).toHaveAttribute('data-multiline', '');
  });

  test('ref gets the control; a mouse down on the box focuses it, but not one on a button in a section', () => {
    let ref: HTMLElement | undefined;
    const { getByRole, getByTestId } = render(() => (
      <Input
        aria-label="Search"
        ref={(el: HTMLElement) => (ref = el)}
        leftSection={<Icon />}
        rightSection={<button type="button">Clear</button>}
      />
    ));
    const control = getByRole('textbox');

    expect(ref).toBe(control);

    const iconDown = fireEvent.mouseDown(getByTestId('icon'));
    expect(iconDown).toBe(false);
    expect(control).toHaveFocus();

    control.blur();
    const buttonDown = fireEvent.mouseDown(getByRole('button', { name: 'Clear' }));
    expect(buttonDown).toBe(true);
    expect(control).not.toHaveFocus();
  });

  test('inside an InputWrapper: its id, description, error, required and size', () => {
    const { getByRole, getByText } = render(() => (
      <InputWrapper label="Email" description="We never share it." error="Enter a valid email." required size="lg">
        <Input type="email" aria-describedby="extra" />
      </InputWrapper>
    ));
    const control = getByRole('textbox', { name: 'Email' });

    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toBeRequired();
    expect(control).toHaveAccessibleDescription('We never share it. Enter a valid email.');
    expect(control.getAttribute('aria-describedby')!.split(' ')).toEqual([
      'extra',
      getByText('We never share it.').id,
      getByText('Enter a valid email.').id,
    ]);
    expect(boxOf(control)).toHaveAttribute('data-size', 'lg');
    expect(boxOf(control)).toHaveAttribute('data-invalid', '');
  });

  test('its own size and invalid win over the wrapper', () => {
    const { getByRole } = render(() => (
      <InputWrapper label="Email" error="Wrong" size="lg">
        <Input size="sm" invalid={false} />
      </InputWrapper>
    ));
    const control = getByRole('textbox');

    expect(boxOf(control)).toHaveAttribute('data-size', 'sm');
    expect(control).not.toHaveAttribute('aria-invalid');
  });

  test('section elements are created once', () => {
    let created = 0;
    const Counted = () => {
      created++;
      return <span>@</span>;
    };
    render(() => <Input aria-label="Handle" leftSection={<Counted />} />);

    expect(created).toBe(1);
  });

  test('turning invalid on updates the box and the control without diagnostics or waste', async () => {
    const [invalid, setInvalid] = createSignal(false, { name: 'invalid' });
    const { getByRole } = render(() => <Input aria-label="Name" invalid={invalid()} />);
    flush();
    const control = getByRole('textbox');

    const { artifact } = await captureArtifact(() => setInvalid(true), { scenario: 'input-invalid' });

    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(boxOf(control)).toHaveAttribute('data-invalid', '');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const variants: InputVariant[] = ['outline', 'soft', 'ghost'];
    const { container } = render(() => (
      <>
        <For each={variants}>{(variant) => <Input aria-label={`Name (${variant})`} variant={variant} />}</For>
        <Input aria-label="Search" leftSection={<Icon />} rightSection={<button type="button">Clear</button>} />
        <Input aria-label="Locked" disabled value="fixed" />
        <Input as="textarea" aria-label="Notes" />
        <InputWrapper label="Email" description="We never share it." error="Enter a valid email." required>
          <Input type="email" />
        </InputWrapper>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./input.fixtures.tsx', 'inputs');
    await expectHydration('./input.fixtures.tsx', 'wrapped');
  });
});
