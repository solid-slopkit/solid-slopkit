import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass, resolveStyleProps } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { Grid } from './grid';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const maxWidth = (span: number) => `max(${width(span)},var(--_grid-grow) * 100%)`;
const width = (span: number) => `calc((100% + var(--_grid-gutter)) * ${span} / var(--_grid-columns) - var(--_grid-gutter))`;

describe('<Grid />', () => {
  test('defaults to 12 columns and a gutter of 4', () => {
    expect(resolveStyleProps({}, 'grid')).toEqual({
      base: ['--_grid-gutter:calc(var(--slp-spacing) * 4)', '--_grid-columns:12'],
    });
  });

  test('gutter is responsive, columns are a plain count', () => {
    expect(resolveStyleProps({ gutter: { base: 2, md: 6 }, columns: 24, justify: 'center' }, 'grid')).toEqual({
      base: ['--_grid-gutter:calc(var(--slp-spacing) * 2)', '--_grid-columns:24', 'justify-content:center'],
      md: ['--_grid-gutter:calc(var(--slp-spacing) * 6)'],
    });
  });

  test('a gutter of 0 has a unit, since it is used in calc()', () => {
    expect(resolveStyleProps({ gutter: 0 }, 'grid')).toEqual({ base: ['--_grid-gutter:0px', '--_grid-columns:12'] });
  });

  test('renders a div with the grid classes and passes other props through', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Grid data-testid="grid" gutter={2} grow class="mine" id="g" />
      </SlopkitUi>
    ));
    flush();
    const grid = getByTestId('grid');

    expect(grid).toHaveClass('slp-grid', 'mine', resolveStyleClass({ gutter: 2 }, 'grid')!.className);
    expect(grid).toHaveAttribute('data-grow', '');
    expect(grid).toHaveAttribute('id', 'g');
    expect(grid).not.toHaveAttribute('gutter');
  });
});

describe('<Grid.Col />', () => {
  test('defaults to the full row, growing when the grid grows', () => {
    expect(resolveStyleProps({}, 'gridCol')).toEqual({
      base: ['flex-basis:100%', 'flex-grow:var(--_grid-grow)', 'max-width:100%'],
    });
  });

  test('span is a share of the columns minus the gutters it does not cover, per breakpoint', () => {
    expect(resolveStyleProps({ span: { base: 12, md: 6, lg: 'auto' }, offset: { md: 3 }, order: 2 }, 'gridCol')).toEqual({
      base: [`flex-basis:${width(12)}`, 'flex-grow:var(--_grid-grow)', `max-width:${maxWidth(12)}`, 'order:2'],
      md: [
        `flex-basis:${width(6)}`,
        `max-width:${maxWidth(6)}`,
        'margin-inline-start:calc((100% + var(--_grid-gutter)) * 3 / var(--_grid-columns))',
      ],
      lg: ['flex-basis:0', 'flex-grow:1', 'max-width:100%'],
    });
  });

  test('span="content" fits the content and never grows', () => {
    expect(resolveStyleProps({ span: 'content' }, 'gridCol')).toEqual({
      base: ['flex-basis:auto', 'flex-grow:0', 'max-width:100%'],
    });
  });

  test('changing span swaps the class without diagnostics or waste', async () => {
    const [span, setSpan] = createSignal(6, { name: 'span' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Grid>
          <Grid.Col data-testid="col" span={span()} />
        </Grid>
      </SlopkitUi>
    ));
    flush();
    const col = getByTestId('col');

    const { artifact } = await captureArtifact(() => setSpan(4), { scenario: 'grid-col-span' });

    expect(col).toHaveClass('slp-grid-col', resolveStyleClass({ span: 4 }, 'gridCol')!.className);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /Grid\.Col/ });
  });

  test('passes other props through', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Grid>
          <Grid.Col data-testid="col" span={6} class="mine" id="c" />
        </Grid>
      </SlopkitUi>
    ));
    flush();
    const col = getByTestId('col');

    expect(col).toHaveClass('slp-grid-col', 'mine');
    expect(col).toHaveAttribute('id', 'c');
    expect(col).not.toHaveAttribute('span');
  });
});

describe('<Grid /> with columns', () => {
  test('changing the gutter and grow updates the grid without diagnostics or waste', async () => {
    const [gutter, setGutter] = createSignal(4, { name: 'gutter' });
    const [grow, setGrow] = createSignal(false, { name: 'grow' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Grid data-testid="grid" gutter={gutter()} grow={grow()}>
          <Grid.Col span={6} />
        </Grid>
      </SlopkitUi>
    ));
    flush();
    const grid = getByTestId('grid');

    const { artifact } = await captureArtifact(
      () => {
        setGutter(8);
        setGrow(true);
      },
      { scenario: 'grid-gutter-grow' },
    );

    expect(grid).toHaveClass(resolveStyleClass({ gutter: 8 }, 'grid')!.className);
    expect(grid).toHaveAttribute('data-grow', '');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /^Grid\./ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>a</Grid.Col>
          <Grid.Col span={6} offset={{ md: 2 }}>
            b
          </Grid.Col>
        </Grid>
        <Grid role="list" aria-label="Plans" grow columns={24} justify="center" align="start">
          <Grid.Col role="listitem" span="auto">
            One
          </Grid.Col>
          <Grid.Col role="listitem" span="content" order={-1}>
            Two
          </Grid.Col>
        </Grid>
      </SlopkitUi>
    ));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./grid.fixtures.tsx', 'columns');
  });
});
