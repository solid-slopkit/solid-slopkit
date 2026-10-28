import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { PasswordInput } from './password-input';

const field = (container: HTMLElement) => container.querySelector<HTMLInputElement>('[data-slot="input-control"]')!;

describe('<PasswordInput />', () => {
  test('a labelled password input with a toggle in the right section', () => {
    const { getByLabelText, getByRole, container } = render(() => (
      <PasswordInput label="Password" autocomplete="current-password" class="mine" />
    ));
    const control = getByLabelText('Password', { selector: 'input' });
    const toggle = getByRole('button', { name: 'Show password', pressed: false });

    expect(control).toHaveAttribute('type', 'password');
    expect(control).toHaveAttribute('autocomplete', 'current-password');
    expect(container.firstElementChild).toHaveClass('slp-password-input', 'slp-input-wrapper', 'mine');
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).toHaveAttribute('data-slot', 'password-input-toggle');
    expect(toggle.closest('[data-slot="input-right-section"]')).not.toBeNull();
  });

  test('uncontrolled: the toggle shows and hides the password and calls onVisibilityChange', () => {
    const onVisibilityChange = vi.fn();
    const { getByRole, container } = render(() => <PasswordInput label="Password" onVisibilityChange={onVisibilityChange} />);
    const toggle = getByRole('button');

    fireEvent.click(toggle);
    flush();
    expect(field(container)).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(toggle);
    flush();
    expect(field(container)).toHaveAttribute('type', 'password');
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
  });

  test('defaultVisible starts it shown; controlled, it follows visible', () => {
    const [visible, setVisible] = createSignal(false);
    const onVisibilityChange = vi.fn();
    const { container, getAllByRole } = render(() => (
      <>
        <PasswordInput label="One" defaultVisible />
        <PasswordInput label="Two" visible={visible()} onVisibilityChange={onVisibilityChange} />
      </>
    ));
    const [one, two] = Array.from(container.querySelectorAll<HTMLInputElement>('[data-slot="input-control"]'));

    expect(one).toHaveAttribute('type', 'text');

    fireEvent.click(getAllByRole('button')[1]);
    flush();
    expect(onVisibilityChange).toHaveBeenCalledWith(true);
    expect(two).toHaveAttribute('type', 'password');

    setVisible(true);
    flush();
    expect(two).toHaveAttribute('type', 'text');
  });

  test('toggleLabel names the toggle; disabled disables it too', () => {
    const { getByRole } = render(() => <PasswordInput label="PIN" toggleLabel="Show PIN" disabled />);

    expect(getByRole('button', { name: 'Show PIN' })).toBeDisabled();
  });

  test('showing the password updates without diagnostics or waste', async () => {
    const { getByRole, container } = render(() => <PasswordInput label="Password" />);
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(getByRole('button'));
        flush();
      },
      { scenario: 'password-input-show' },
    );

    expect(field(container)).toHaveAttribute('type', 'text');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(6);
  });

  test('has no axe violations, hidden and shown', async () => {
    const { container } = render(() => (
      <>
        <PasswordInput label="Password" />
        <PasswordInput label="New password" description="At least 12 characters." defaultVisible />
        <PasswordInput label="Locked" disabled />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./password-input.fixtures.tsx', 'passwordInputs');
  });
});
