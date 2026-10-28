import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass, resolveStyleProps } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { SimpleGrid } from './simple-grid';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const gridClass = (props: Parameters<typeof resolveStyleClass>[0]) => resolveStyleClass(props, 'simpleGrid')!.className;

describe('<SimpleGrid />', () => {
  test('defaults to one column with a gap of 4', () => {
    expect(resolveStyleProps({}, 'simpleGrid')).toEqual({
      base: [
        'display:grid',
        'grid-template-columns:repeat(1,minmax(0,1fr))',
        'row-gap:calc(var(--slp-spacing) * 4)',
        'column-gap:calc(var(--slp-spacing) * 4)',
      ],
    });
  });

  test('cols are equal columns per breakpoint, and verticalSpacing wins over spacing for rows', () => {
    expect(resolveStyleProps({ cols: { base: 1, sm: 2, lg: 4 }, spacing: 2, verticalSpacing: { md: 6 } }, 'simpleGrid')).toEqual({
      base: [
        'display:grid',
        'grid-template-columns:repeat(1,minmax(0,1fr))',
        'row-gap:calc(var(--slp-spacing) * 2)',
        'column-gap:calc(var(--slp-spacing) * 2)',
      ],
      sm: ['grid-template-columns:repeat(2,minmax(0,1fr))'],
      md: ['row-gap:calc(var(--slp-spacing) * 6)'],
      lg: ['grid-template-columns:repeat(4,minmax(0,1fr))'],
    });
  });

  test('renders a div with the grid class and passes other props through', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <SimpleGrid data-testid="grid" cols={3} spacing={2} class="mine" id="g" />
      </SlopkitUi>
    ));
    flush();
    const grid = getByTestId('grid');

    expect(grid.tagName).toBe('DIV');
    expect(grid).toHaveClass('slp-simple-grid', 'mine', gridClass({ cols: 3, spacing: 2 }));
    expect(grid).toHaveAttribute('id', 'g');
    expect(grid).not.toHaveAttribute('cols');
    expect(grid).not.toHaveAttribute('spacing');
  });

  test('changing cols swaps the class without diagnostics or waste', async () => {
    const [cols, setCols] = createSignal(2, { name: 'cols' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <SimpleGrid data-testid="grid" cols={cols()} />
      </SlopkitUi>
    ));
    flush();
    const grid = getByTestId('grid');

    const { artifact } = await captureArtifact(() => setCols(5), { scenario: 'simple-grid-cols' });

    expect(grid).toHaveClass(gridClass({ cols: 5 }));
    expect(grid).not.toHaveClass(gridClass({ cols: 2 }));
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /SimpleGrid/ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={2}>
          <p>a</p>
          <p>b</p>
          <p>c</p>
        </SimpleGrid>
        <SimpleGrid role="list" aria-label="Products" cols={2} verticalSpacing={8}>
          <div role="listitem">One</div>
          <div role="listitem">Two</div>
        </SimpleGrid>
      </SlopkitUi>
    ));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./simple-grid.fixtures.tsx', 'responsive');
  });
});
