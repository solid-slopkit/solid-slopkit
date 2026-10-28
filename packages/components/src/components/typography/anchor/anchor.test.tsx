import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import type { JSX } from '@solidjs/web';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Anchor, type AnchorUnderline } from './anchor';

describe('<Anchor />', () => {
  test('renders a primary link that inherits its size and is always underlined', () => {
    const { getByRole } = render(() => <Anchor href="/docs">Docs</Anchor>);
    const link = getByRole('link', { name: 'Docs' });

    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveClass('slp-anchor', 'slp-text');
    expect(link).toHaveAttribute('data-color', 'primary');
    expect(link).toHaveAttribute('data-underline', 'always');
    expect(link).toHaveAttribute('data-inherit', '');
    expect(link).not.toHaveAttribute('data-size');
  });

  test('size, color, underline and Text props apply, and the rest reaches the link', () => {
    const { getByRole } = render(() => (
      <Anchor href="/x" size="sm" color="error" underline="hover" weight="medium" target="_blank" rel="noreferrer" class="mine">
        Small
      </Anchor>
    ));
    const link = getByRole('link', { name: 'Small' });

    expect(link).toHaveAttribute('data-size', 'sm');
    expect(link).not.toHaveAttribute('data-inherit');
    expect(link).toHaveAttribute('data-color', 'error');
    expect(link).toHaveAttribute('data-underline', 'hover');
    expect(link).toHaveAttribute('data-weight', 'medium');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveClass('mine');
    expect(link).not.toHaveAttribute('underline');
  });

  test('as renders another link component', () => {
    const RouterLink = (props: { href: string; children?: JSX.Element; class?: string }) => <a {...props} data-router="" />;
    const { getByRole } = render(() => (
      <Anchor as={RouterLink} href="/settings">
        Settings
      </Anchor>
    ));
    const link = getByRole('link', { name: 'Settings' });

    expect(link).toHaveAttribute('data-router', '');
    expect(link).toHaveClass('slp-anchor');
  });

  test('changing underline updates the attribute without diagnostics or waste', async () => {
    const [underline, setUnderline] = createSignal<AnchorUnderline>('always', { name: 'underline' });
    const { getByRole } = render(() => (
      <Anchor href="/a" underline={underline()}>
        Link
      </Anchor>
    ));
    flush();
    const link = getByRole('link', { name: 'Link' });

    const { artifact } = await captureArtifact(() => setUnderline('never'), { scenario: 'anchor-underline' });

    expect(link).toHaveAttribute('data-underline', 'never');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <p>
        Read the <Anchor href="/terms">terms</Anchor> or the{' '}
        <Anchor href="/faq" underline="hover" size="sm">
          FAQ
        </Anchor>
        .
      </p>
    ));

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./anchor.fixtures.tsx', 'links');
  });
});
