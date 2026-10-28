import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Title, type TitleOrder, type TitleSize } from './title';

describe('<Title />', () => {
  test('renders an h1 with its look by default', () => {
    const { getByRole } = render(() => <Title>Page</Title>);
    const title = getByRole('heading', { level: 1, name: 'Page' });

    expect(title.tagName).toBe('H1');
    expect(title).toHaveClass('slp-title');
    expect(title).toHaveAttribute('data-order', '1');
    expect(title).toHaveAttribute('data-size', 'h1');
    for (const name of ['data-color', 'data-dimmed', 'data-weight', 'data-align']) expect(title).not.toHaveAttribute(name);
  });

  test('order picks the element and the look; size changes only the look', () => {
    const { getByRole } = render(() => (
      <>
        <Title order={3}>Three</Title>
        <Title order={2} size="h5">
          Two
        </Title>
      </>
    ));

    expect(getByRole('heading', { level: 3, name: 'Three' })).toHaveAttribute('data-size', 'h3');
    const two = getByRole('heading', { level: 2, name: 'Two' });
    expect(two.tagName).toBe('H2');
    expect(two).toHaveAttribute('data-size', 'h5');
  });

  test('reflects color, dimmed and weight, and passes the rest to the heading', () => {
    const { getByRole } = render(() => (
      <Title order={2} color="primary" dimmed weight="medium" align="center" id="t" class="mine">
        Section
      </Title>
    ));
    const title = getByRole('heading', { name: 'Section' });

    expect(title).toHaveClass('slp-title', 'mine');
    expect(title).toHaveAttribute('data-color', 'primary');
    expect(title).toHaveAttribute('data-dimmed', '');
    expect(title).toHaveAttribute('data-weight', 'medium');
    expect(title).toHaveAttribute('data-align', 'center');
    expect(title).toHaveAttribute('id', 't');
    expect(title).not.toHaveAttribute('order');
    expect(title).not.toHaveAttribute('color');
  });

  test('changing order swaps the element, keeping its content', () => {
    const [order, setOrder] = createSignal<TitleOrder>(1);
    const { getByRole, queryByRole } = render(() => <Title order={order()}>Moving</Title>);

    setOrder(4);
    flush();

    expect(queryByRole('heading', { level: 1 })).toBeNull();
    expect(getByRole('heading', { level: 4, name: 'Moving' })).toHaveAttribute('data-size', 'h4');
  });

  test('changing size and color updates attributes without diagnostics or waste', async () => {
    const [size, setSize] = createSignal<TitleSize | undefined>(undefined, { name: 'size' });
    const [dimmed, setDimmed] = createSignal(false, { name: 'dimmed' });
    const { getByRole } = render(() => (
      <Title order={2} size={size()} dimmed={dimmed()}>
        Section
      </Title>
    ));
    flush();
    const title = getByRole('heading', { name: 'Section' });

    const { artifact } = await captureArtifact(
      () => {
        setSize('h4');
        setDimmed(true);
      },
      { scenario: 'title-props' },
    );

    expect(title).toHaveAttribute('data-size', 'h4');
    expect(title).toHaveAttribute('data-dimmed', '');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Title>Page</Title>
        <Title order={2} color="primary">
          Section
        </Title>
        <Title order={3} size="h5" dimmed weight="semibold">
          Subsection
        </Title>
      </>
    ));

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./title.fixtures.tsx', 'levels');
  });
});
