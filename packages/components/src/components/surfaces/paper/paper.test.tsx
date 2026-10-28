import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Paper, type PaperShadow } from './paper';

describe('<Paper />', () => {
  test('renders a div with its defaults', () => {
    const { getByText } = render(() => <Paper>Content</Paper>);
    const paper = getByText('Content');

    expect(paper.tagName).toBe('DIV');
    expect(paper).toHaveClass('slp-paper');
    expect(paper).toHaveAttribute('data-padding', 'md');
    expect(paper).toHaveAttribute('data-shadow', 'none');
    expect(paper).toHaveAttribute('data-surface', 'base-100');
    expect(paper).toHaveAttribute('data-radius', 'default');
    expect(paper).not.toHaveAttribute('data-with-border');
  });

  test('reflects its props as data attributes, and passes the rest to the div', () => {
    const { getByRole } = render(() => (
      <Paper
        padding="none"
        shadow="lg"
        surface="base-200"
        radius="none"
        withBorder
        role="region"
        aria-label="Billing"
        class="mine"
      >
        Content
      </Paper>
    ));
    const paper = getByRole('region', { name: 'Billing' });

    expect(paper).toHaveClass('slp-paper', 'mine');
    expect(paper).toHaveAttribute('data-padding', 'none');
    expect(paper).toHaveAttribute('data-shadow', 'lg');
    expect(paper).toHaveAttribute('data-surface', 'base-200');
    expect(paper).toHaveAttribute('data-radius', 'none');
    expect(paper).toHaveAttribute('data-with-border', '');
    expect(paper).not.toHaveAttribute('shadow');
  });

  test('prop changes update attributes without diagnostics or waste', async () => {
    const [shadow, setShadow] = createSignal<PaperShadow>('none', { name: 'shadow' });
    const [border, setBorder] = createSignal(false, { name: 'withBorder' });
    const { getByText } = render(() => (
      <Paper shadow={shadow()} withBorder={border()}>
        Content
      </Paper>
    ));
    flush();
    const paper = getByText('Content');

    const { artifact } = await captureArtifact(
      () => {
        setShadow('md');
        setBorder(true);
      },
      { scenario: 'paper-props' },
    );

    expect(paper).toHaveAttribute('data-shadow', 'md');
    expect(paper).toHaveAttribute('data-with-border', '');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Paper>
          <p>Plain</p>
        </Paper>
        <Paper role="region" aria-label="Settings" shadow="sm" withBorder surface="base-200" padding="lg">
          <p>Region</p>
        </Paper>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./paper.fixtures.tsx', 'variants');
  });
});
