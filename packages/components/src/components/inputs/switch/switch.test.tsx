import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Switch } from './switch';

const click = (el: HTMLElement) => {
  fireEvent.click(el);
  flush();
};

describe('<Switch />', () => {
  test('a checkbox with role="switch", labelled, with a hidden thumb', () => {
    const { getByRole, container } = render(() => <Switch label="Wi-Fi" name="wifi" class="mine" />);
    const control = getByRole('switch', { name: 'Wi-Fi' });
    const root = container.firstElementChild!;

    expect(control).toHaveAttribute('type', 'checkbox');
    expect(control).toHaveAttribute('name', 'wifi');
    expect(control).toHaveAttribute('data-slot', 'switch-track');
    expect(control).not.toBeChecked();
    expect(root).toHaveClass('slp-switch', 'mine');
    expect(root.querySelector('[data-slot="switch-thumb"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('uncontrolled: a click flips it and calls onChange; defaultChecked starts it on', () => {
    const onChange = vi.fn();
    const { getAllByRole, container } = render(() => (
      <>
        <Switch label="One" onChange={onChange} />
        <Switch label="Two" defaultChecked />
      </>
    ));
    const [one, two] = getAllByRole('switch');

    expect(two).toBeChecked();
    click(one);
    expect(one).toBeChecked();
    expect(container.firstElementChild).toHaveAttribute('data-checked', '');
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  test('controlled: it follows checked, and a click the parent ignores is undone', () => {
    const [checked, setChecked] = createSignal(false);
    const onChange = vi.fn();
    const { getByRole } = render(() => <Switch label="Wi-Fi" checked={checked()} onChange={onChange} />);
    const control = getByRole('switch');

    click(control);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(control).not.toBeChecked();
    setChecked(true);
    flush();
    expect(control).toBeChecked();
  });

  test('description and error describe it; disabled disables the input', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Switch label="Airplane mode" description="Turns off radios." error="Not allowed." disabled onChange={onChange} />
    ));
    const control = getByRole('switch');

    expect(control).toHaveAccessibleDescription('Turns off radios. Not allowed.');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toBeDisabled();
    expect(control.closest('.slp-switch')).toHaveAttribute('data-disabled', '');
  });

  test('a switch that is on submits its value, or "on" without one', () => {
    const { container } = render(() => (
      <form>
        <Switch label="Wi-Fi" name="wifi" defaultChecked />
        <Switch label="Bluetooth" name="bluetooth" value="enabled" defaultChecked />
      </form>
    ));
    const data = new FormData(container.querySelector('form')!);

    expect(data.get('wifi')).toBe('on');
    expect(data.get('bluetooth')).toBe('enabled');
  });

  test('Switch.Group holds the values of the switches that are on', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Switch.Group label="Notifications" defaultValue={['email']} onChange={onChange}>
        <Switch value="email" label="Email" />
        <Switch value="sms" label="Text message" />
      </Switch.Group>
    ));

    expect(getByRole('group', { name: 'Notifications' })).toBeInTheDocument();
    expect(getByRole('switch', { name: 'Email' })).toBeChecked();
    click(getByRole('switch', { name: 'Text message' }));
    expect(onChange).toHaveBeenCalledWith(['email', 'sms']);
  });

  test('flipping updates it without diagnostics or waste', async () => {
    const { getByRole } = render(() => <Switch label="Wi-Fi" />);
    flush();

    const { artifact } = await captureArtifact(() => click(getByRole('switch')), { scenario: 'switch-flip' });

    expect(getByRole('switch')).toBeChecked();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Switch label="Wi-Fi" />
        <Switch label="Bluetooth" description="Visible to nearby devices." defaultChecked />
        <Switch label="Airplane mode" error="Not allowed." disabled />
        <Switch.Group label="Notifications" defaultValue={['email']}>
          <Switch value="email" label="Email" />
          <Switch value="sms" label="Text message" />
        </Switch.Group>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./switch.fixtures.tsx', 'switches');
  });
});
