import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import type { SlopColor } from '../../../core';
import { ThemeIcon, type ThemeIconVariant } from './theme-icon';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

describe('<ThemeIcon />', () => {
  test('a span around its child, solid and md by default, with no role', () => {
    const { container } = render(() => (
      <ThemeIcon>
        <Icon />
      </ThemeIcon>
    ));
    const box = container.firstElementChild!;

    expect(box.tagName).toBe('SPAN');
    expect(box).toHaveClass('slp-theme-icon');
    expect(box).toHaveAttribute('data-variant', 'solid');
    expect(box).toHaveAttribute('data-size', 'md');
    expect(box).not.toHaveAttribute('data-color');
    expect(box).not.toHaveAttribute('role');
    expect(box.firstElementChild!.tagName).toBe('svg');
  });

  test('variant, color and size are data attributes; other props pass through', () => {
    const { getByRole } = render(() => (
      <ThemeIcon variant="soft" color="info" size="xl" role="img" aria-label="Info" id="t" class="mine">
        <Icon />
      </ThemeIcon>
    ));
    const box = getByRole('img', { name: 'Info' });

    expect(box).toHaveAttribute('data-variant', 'soft');
    expect(box).toHaveAttribute('data-color', 'info');
    expect(box).toHaveAttribute('data-size', 'xl');
    expect(box).toHaveAttribute('id', 't');
    expect(box).toHaveClass('slp-theme-icon', 'mine');
  });

  test('changing the color updates the attribute without diagnostics or waste', async () => {
    const [color, setColor] = createSignal<SlopColor>('primary', { name: 'color' });
    const { container } = render(() => (
      <ThemeIcon color={color()}>
        <Icon />
      </ThemeIcon>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setColor('warning'), { scenario: 'theme-icon-color' });

    expect(container.firstElementChild).toHaveAttribute('data-color', 'warning');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const variants: ThemeIconVariant[] = ['solid', 'soft', 'outline'];
    const { container } = render(() => (
      <>
        <For each={variants}>
          {(variant) => (
            <ThemeIcon variant={variant} color="primary">
              <Icon />
            </ThemeIcon>
          )}
        </For>
        <ThemeIcon role="img" aria-label="Warning" color="warning">
          <Icon />
        </ThemeIcon>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./theme-icon.fixtures.tsx', 'icons');
  });
});
