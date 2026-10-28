import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass, resolveStyleProps, type AllStyleProps, type FlexDirection } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { Flex } from './flex';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const flexClass = (props: AllStyleProps) => resolveStyleClass(props, 'flex')!.className;

describe('<Flex />', () => {
  test('renders a div with its root class and passes other props through', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Flex data-testid="flex" class="mine" id="f" role="toolbar" aria-label="Actions" gap={2} justify="center">
          Content
        </Flex>
      </SlopkitUi>
    ));
    flush();
    const flex = getByTestId('flex');

    expect(flex.tagName).toBe('DIV');
    expect(flex).toHaveClass('slp-flex', 'mine', flexClass({ gap: 2, justify: 'center' }));
    expect(flex).toHaveAttribute('id', 'f');
    expect(flex).toHaveAttribute('role', 'toolbar');
    expect(flex).toHaveAttribute('aria-label', 'Actions');
    expect(flex).not.toHaveAttribute('gap');
    expect(flex).not.toHaveAttribute('justify');
  });

  test('without props, is a plain display: flex', () => {
    expect(resolveStyleProps({}, 'flex')).toEqual({ base: ['display:flex'] });

    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Flex data-testid="flex" />
      </SlopkitUi>
    ));
    flush();

    expect(getByTestId('flex')).toHaveClass('slp-flex', flexClass({}));
  });

  test('throws outside <SlopkitUi>', () => {
    expect(() => render(() => <Flex />)).toThrow(/SlopkitUi/);
  });

  describe('style props', () => {
    test('each prop sets its CSS property, gaps in spacing units', () => {
      expect(
        resolveStyleProps({ direction: 'column', wrap: 'wrap', align: 'center', justify: 'space-between', gap: 2 }, 'flex'),
      ).toEqual({
        base: [
          'display:flex',
          'flex-direction:column',
          'flex-wrap:wrap',
          'align-items:center',
          'justify-content:space-between',
          'row-gap:calc(var(--slp-spacing) * 2)',
          'column-gap:calc(var(--slp-spacing) * 2)',
        ],
      });
    });

    test('rowGap and columnGap win over gap', () => {
      expect(resolveStyleProps({ gap: 2, rowGap: 4 }, 'flex')).toEqual({
        base: ['display:flex', 'row-gap:calc(var(--slp-spacing) * 4)', 'column-gap:calc(var(--slp-spacing) * 2)'],
      });
    });

    test('display overrides flex, per breakpoint', () => {
      expect(resolveStyleProps({ display: 'inline-flex' }, 'flex')).toEqual({ base: ['display:inline-flex'] });
      expect(resolveStyleProps({ display: { base: 'none', sm: 'flex' } }, 'flex')).toEqual({
        base: ['display:none'],
        sm: ['display:flex'],
      });
    });

    test('responsive values are mobile-first', () => {
      expect(resolveStyleProps({ direction: { base: 'column', md: 'row' }, gap: { md: 4 } }, 'flex')).toEqual({
        base: ['display:flex', 'flex-direction:column'],
        md: ['flex-direction:row', 'row-gap:calc(var(--slp-spacing) * 4)', 'column-gap:calc(var(--slp-spacing) * 4)'],
      });
    });

    test('align and justify take any CSS string, but not one that could escape the rule', () => {
      expect(resolveStyleProps({ align: 'last baseline', justify: 'x}body{y' }, 'flex')).toEqual({
        base: ['display:flex', 'align-items:last baseline'],
      });
    });
  });

  test('changing style props swaps the class without diagnostics or waste', async () => {
    const [direction, setDirection] = createSignal<FlexDirection>('row', { name: 'direction' });
    const [gap, setGap] = createSignal(2, { name: 'gap' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Flex data-testid="flex" direction={direction()} gap={gap()} />
      </SlopkitUi>
    ));
    flush();
    const flex = getByTestId('flex');

    const { artifact } = await captureArtifact(
      () => {
        setDirection('column');
        setGap(6);
      },
      { scenario: 'flex-style-props' },
    );

    expect(flex).toHaveClass(flexClass({ direction: 'column', gap: 6 }));
    expect(flex).not.toHaveClass(flexClass({ direction: 'row', gap: 2 }));
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /Flex/ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Flex gap={2}>
          <span>a</span>
          <span>b</span>
        </Flex>
        <Flex role="toolbar" aria-label="Actions" direction={{ base: 'column', md: 'row' }} display="inline-flex">
          <button type="button">Save</button>
        </Flex>
      </SlopkitUi>
    ));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./flex.fixtures.tsx', 'styleProps');
  });
});
