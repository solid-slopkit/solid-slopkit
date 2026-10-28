import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import type { SlopColor } from '../../../core';
import { Badge, type BadgeVariant } from './badge';

const colors: SlopColor[] = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'];
const variants: BadgeVariant[] = ['solid', 'soft', 'outline', 'dash'];

describe('<Badge />', () => {
  test('renders a span with the label in a slot, and the default attributes', () => {
    const { getByText } = render(() => <Badge>New</Badge>);
    const label = getByText('New');
    const badge = label.parentElement!;

    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass('slp-badge');
    expect(badge).toHaveAttribute('data-variant', 'solid');
    expect(badge).toHaveAttribute('data-size', 'md');
    expect(badge).not.toHaveAttribute('data-color');
    expect(badge).not.toHaveAttribute('data-circle');
    expect(badge).not.toHaveAttribute('role');
    expect(label).toHaveAttribute('data-slot', 'badge-label');
  });

  test('variant, color, size and circle are data attributes; other props pass through', () => {
    const { getByText } = render(() => (
      <Badge variant="soft" color="error" size="lg" circle id="b" class="mine" title="Unread">
        3
      </Badge>
    ));
    const badge = getByText('3').parentElement!;

    expect(badge).toHaveAttribute('data-variant', 'soft');
    expect(badge).toHaveAttribute('data-color', 'error');
    expect(badge).toHaveAttribute('data-size', 'lg');
    expect(badge).toHaveAttribute('data-circle', '');
    expect(badge).toHaveAttribute('id', 'b');
    expect(badge).toHaveAttribute('title', 'Unread');
    expect(badge).toHaveClass('slp-badge', 'mine');
    expect(badge).not.toHaveAttribute('circle');
  });

  test('sections go before and after the label, as direct children', () => {
    const { getByText } = render(() => (
      <Badge leftSection={<i>left</i>} rightSection={<b>right</b>}>
        Label
      </Badge>
    ));
    const badge = getByText('Label').parentElement!;

    expect([...badge.children].map((child) => child.textContent)).toEqual(['left', 'Label', 'right']);
  });

  test('changing the color updates the attribute without diagnostics or waste', async () => {
    const [color, setColor] = createSignal<SlopColor>('primary', { name: 'color' });
    const { getByText } = render(() => <Badge color={color()}>Status</Badge>);
    flush();
    const badge = getByText('Status').parentElement!;

    const { artifact } = await captureArtifact(() => setColor('success'), { scenario: 'badge-color' });

    expect(badge).toHaveAttribute('data-color', 'success');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <p>
          Status <Badge>Draft</Badge>
        </p>
        <For each={variants}>
          {(variant) => (
            <For each={colors}>
              {(color) => (
                <Badge variant={variant} color={color}>
                  {`${variant} ${color}`}
                </Badge>
              )}
            </For>
          )}
        </For>
        <Badge size="xs" circle color="error">
          3
        </Badge>
        <Badge size="xl" leftSection={<svg aria-hidden="true" />}>
          With icon
        </Badge>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./badge.fixtures.tsx', 'variants');
  });
});
