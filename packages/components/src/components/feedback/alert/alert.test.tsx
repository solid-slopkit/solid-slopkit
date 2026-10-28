import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import type { SlopColor } from '../../../core';
import { Alert, type AlertVariant } from './alert';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;
const slot = (root: Element, name: string) => root.querySelector(`[data-slot="alert-${name}"]`);

describe('<Alert />', () => {
  test('a div with role="alert", info and soft by default, with the message in a slot', () => {
    const { getByRole } = render(() => <Alert>Something happened.</Alert>);
    const alert = getByRole('alert');

    expect(alert.tagName).toBe('DIV');
    expect(alert).toHaveClass('slp-alert');
    expect(alert).toHaveAttribute('data-color', 'info');
    expect(alert).toHaveAttribute('data-variant', 'soft');
    expect(alert).not.toHaveAttribute('data-with-icon');
    expect(slot(alert, 'message')).toHaveTextContent('Something happened.');
    expect(slot(alert, 'title')).toBeNull();
    expect(slot(alert, 'icon')).toBeNull();
  });

  test('title and icon get their slots; color, variant and other props pass through', () => {
    const { getByRole } = render(() => (
      <Alert title="Payment failed" icon={<Icon />} color="error" variant="solid" id="a" class="mine">
        Your card was declined.
      </Alert>
    ));
    const alert = getByRole('alert');

    expect(slot(alert, 'title')).toHaveTextContent('Payment failed');
    expect(slot(alert, 'icon')!.querySelector('svg')).not.toBeNull();
    expect(alert).toHaveAttribute('data-with-icon', '');
    expect(alert).toHaveAttribute('data-color', 'error');
    expect(alert).toHaveAttribute('data-variant', 'solid');
    expect(alert).toHaveAttribute('id', 'a');
    expect(alert).toHaveClass('slp-alert', 'mine');
    expect(alert).not.toHaveAttribute('title');
  });

  test('role can be changed, for a polite status or a static note', () => {
    const { getByRole } = render(() => (
      <>
        <Alert role="status">Saved.</Alert>
        <Alert role="note">The theme may change.</Alert>
      </>
    ));

    expect(getByRole('status')).toHaveClass('slp-alert');
    expect(getByRole('note')).toHaveClass('slp-alert');
  });

  test('onClose shows a close button at the end, which calls it', () => {
    const onClose = vi.fn();
    const { getAllByRole, getByRole } = render(() => (
      <>
        <Alert onClose={onClose}>Closable.</Alert>
        <Alert closeButtonLabel="Dismiss">Not closable.</Alert>
      </>
    ));
    const [closable, plain] = getAllByRole('alert');
    const button = getByRole('button', { name: 'Close' });

    expect(slot(closable, 'close-button')).toBe(button);
    expect(closable.lastElementChild).toBe(button);
    expect(button).toHaveClass('slp-close-button');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(slot(plain, 'close-button')).toBeNull();
    expect(closable).not.toHaveAttribute('closebuttonlabel');

    button.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('closeButtonLabel names the close button', () => {
    const { getByRole } = render(() => (
      <Alert onClose={() => {}} closeButtonLabel="Dismiss">
        Closable.
      </Alert>
    ));

    expect(getByRole('button', { name: 'Dismiss' })).toHaveAttribute('data-slot', 'alert-close-button');
  });

  test('title and icon elements are created once', () => {
    let created = 0;
    const Counted = () => {
      created++;
      return <span>x</span>;
    };
    render(() => (
      <Alert title={<Counted />} icon={<Counted />}>
        Message
      </Alert>
    ));

    expect(created).toBe(2);
  });

  test('changing the color updates the attribute without diagnostics or waste', async () => {
    const [color, setColor] = createSignal<SlopColor>('info', { name: 'color' });
    const { getByRole } = render(() => (
      <Alert color={color()} title="Title">
        Message
      </Alert>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setColor('warning'), { scenario: 'alert-color' });

    expect(getByRole('alert')).toHaveAttribute('data-color', 'warning');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const variants: AlertVariant[] = ['soft', 'solid', 'outline'];
    const { container } = render(() => (
      <For each={variants}>
        {(variant) => (
          <Alert variant={variant} color="warning" title="Heads up" icon={<Icon />} onClose={() => {}}>
            <p>The default theme may still change.</p>
          </Alert>
        )}
      </For>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./alert.fixtures.tsx', 'alerts');
  });
});
