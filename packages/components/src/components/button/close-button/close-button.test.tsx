import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import type { SlopSize } from '../../../core';
import { CloseButton } from './close-button';

describe('<CloseButton />', () => {
  test('a square ghost button named "Close", with a hidden X icon', () => {
    const { getByRole } = render(() => <CloseButton />);
    const button = getByRole('button', { name: 'Close' });
    const icon = button.querySelector('svg')!;

    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('slp-close-button', 'slp-button');
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-shape', 'square');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).not.toHaveAttribute('data-color');
    expect(icon).toHaveAttribute('data-slot', 'close-button-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  test('label, size and color are set; other props pass through', () => {
    const { getByRole } = render(() => (
      <CloseButton label="Dismiss" size="xs" color="error" id="c" class="mine" title="Dismiss the message" />
    ));
    const button = getByRole('button', { name: 'Dismiss' });

    expect(button).toHaveAttribute('data-size', 'xs');
    expect(button).toHaveAttribute('data-color', 'error');
    expect(button).toHaveAttribute('id', 'c');
    expect(button).toHaveAttribute('title', 'Dismiss the message');
    expect(button).toHaveClass('slp-close-button', 'slp-button', 'mine');
    expect(button).not.toHaveAttribute('label');
  });

  test('children replace the icon', () => {
    const { getByRole } = render(() => (
      <CloseButton>
        <svg data-testid="mine" aria-hidden="true" />
      </CloseButton>
    ));
    const button = getByRole('button', { name: 'Close' });

    expect(button.querySelectorAll('svg')).toHaveLength(1);
    expect(button.querySelector('svg')).toHaveAttribute('data-testid', 'mine');
  });

  test('a click calls onClick; a disabled button ignores it', () => {
    const onClick = vi.fn();
    const onDisabledClick = vi.fn();
    const { getAllByRole } = render(() => (
      <>
        <CloseButton onClick={onClick} />
        <CloseButton disabled onClick={onDisabledClick} />
      </>
    ));
    const [enabled, disabled] = getAllByRole('button');

    fireEvent.click(enabled);
    fireEvent.click(disabled);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(disabled).toBeDisabled();
    expect(onDisabledClick).not.toHaveBeenCalled();
  });

  test('changing the size updates the attribute without diagnostics or waste', async () => {
    const [size, setSize] = createSignal<SlopSize>('md', { name: 'size' });
    const { getByRole } = render(() => <CloseButton size={size()} />);
    flush();
    const button = getByRole('button');

    const { artifact } = await captureArtifact(() => setSize('lg'), { scenario: 'close-button-size' });

    expect(button).toHaveAttribute('data-size', 'lg');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <CloseButton />
        <CloseButton size="xs" color="error" label="Dismiss" />
        <CloseButton disabled />
        <CloseButton label="Remove">
          <svg aria-hidden="true" viewBox="0 0 24 24" />
        </CloseButton>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./close-button.fixtures.tsx', 'closeButtons');
  });
});
