import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass, resolveStyleProps, type AllStyleProps } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { Box } from './box';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const spacingClass = (props: AllStyleProps) => resolveStyleClass(props, 'spacing')!.className;

describe('<Box />', () => {
  test('renders a div with its root class and passes other props through', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Box data-testid="box" class="mine" id="b" aria-label="Region" role="region" p={4} w="50%">
          Content
        </Box>
      </SlopkitUi>
    ));
    flush();
    const box = getByTestId('box');

    expect(box.tagName).toBe('DIV');
    expect(box).toHaveClass('slp-box', 'mine', spacingClass({ p: 4 }), resolveStyleClass({ w: '50%' }, 'size')!.className);
    expect(box).toHaveAttribute('id', 'b');
    expect(box).toHaveAttribute('role', 'region');
    expect(box).toHaveAttribute('aria-label', 'Region');
    expect(box).not.toHaveAttribute('p');
    expect(box).not.toHaveAttribute('w');
    expect(box).toHaveTextContent('Content');
  });

  test('without style props, has only its root class', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Box data-testid="box" />
      </SlopkitUi>
    ));
    flush();

    expect(getByTestId('box').getAttribute('class')).toBe('slp-box');
  });

  test('takes class as an array or object, and style as an object', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Box data-testid="a" class={['one', { two: true, three: false }]} style={{ color: 'red' }} p={2} />
      </SlopkitUi>
    ));
    flush();

    expect(getByTestId('a')).toHaveClass('slp-box', 'one', 'two', spacingClass({ p: 2 }));
    expect(getByTestId('a')).not.toHaveClass('three');
    expect(getByTestId('a').style.color).toBe('red');
  });

  test('style is an object only: a CSS string is a type error', () => {
    const css = 'color: blue';
    // @ts-expect-error -- every component types `style` as an object (ElementProps)
    const rejected = () => <Box style={css} />;
    expect(rejected).toBeTypeOf('function');
  });

  test('throws outside <SlopkitUi>', () => {
    expect(() => render(() => <Box />)).toThrow(/SlopkitUi/);
  });

  describe('style props', () => {
    test('numbers are spacing units, 0 is 0', () => {
      expect(resolveStyleProps({ p: 4, mt: 0 }, 'spacing')).toEqual({
        base: [
          'padding-top:calc(var(--slp-spacing) * 4)',
          'padding-right:calc(var(--slp-spacing) * 4)',
          'padding-bottom:calc(var(--slp-spacing) * 4)',
          'padding-left:calc(var(--slp-spacing) * 4)',
          'margin-top:0',
        ],
      });
    });

    test('a side wins over its axis, the axis over the shorthand', () => {
      expect(resolveStyleProps({ p: 1, px: 2, pl: 3 }, 'spacing')).toEqual({
        base: [
          'padding-top:calc(var(--slp-spacing) * 1)',
          'padding-right:calc(var(--slp-spacing) * 2)',
          'padding-bottom:calc(var(--slp-spacing) * 1)',
          'padding-left:calc(var(--slp-spacing) * 3)',
        ],
      });
    });

    test('margins take negative values and auto', () => {
      expect(resolveStyleProps({ mx: 'auto', my: -2 }, 'spacing')).toEqual({
        base: [
          'margin-top:calc(var(--slp-spacing) * -2)',
          'margin-right:auto',
          'margin-bottom:calc(var(--slp-spacing) * -2)',
          'margin-left:auto',
        ],
      });
    });

    test('sizes take spacing units or CSS strings, and ignore strings that could escape the rule', () => {
      expect(resolveStyleProps({ w: 24, maw: 'calc(100% - 2rem)', h: 'red;}body{x:y' }, 'size')).toEqual({
        base: ['width:calc(var(--slp-spacing) * 24)', 'max-width:calc(100% - 2rem)'],
      });
    });

    test('responsive values are mobile-first and only emitted where they change', () => {
      expect(resolveStyleProps({ display: { base: 'none', sm: 'block', md: 'block' } }, 'display')).toEqual({
        base: ['display:none'],
        sm: ['display:block'],
      });
      const { className, css } = resolveStyleClass({ display: { base: 'none', sm: 'block' } }, 'display')!;
      expect(css).toBe(
        `@layer slopkit.components{.${className}{display:none}@media (min-width:48em){.${className}{display:block}}}`,
      );
    });

    test('each prop carries its value up the breakpoints before specificity applies', () => {
      // pl={2} keeps winning at md, although p only starts there.
      expect(resolveStyleProps({ p: { md: 8 }, pl: 2 }, 'spacing')).toEqual({
        base: ['padding-left:calc(var(--slp-spacing) * 2)'],
        md: [
          'padding-top:calc(var(--slp-spacing) * 8)',
          'padding-right:calc(var(--slp-spacing) * 8)',
          'padding-bottom:calc(var(--slp-spacing) * 8)',
        ],
      });
    });

    test('boxes with the same values share a class', () => {
      const { getByTestId } = render(() => (
        <SlopkitUi>
          <Box data-testid="a" p={2} />
          <Box data-testid="b" py={2} px={2} />
        </SlopkitUi>
      ));
      flush();

      expect(getByTestId('a').className).toBe(getByTestId('b').className);
    });
  });

  test('changing style props swaps classes without diagnostics or waste', async () => {
    const [padding, setPadding] = createSignal(2, { name: 'padding' });
    const [width, setWidth] = createSignal<string | number>('100%', { name: 'width' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Box data-testid="box" p={padding()} w={width()} display="block" />
      </SlopkitUi>
    ));
    flush();
    const box = getByTestId('box');

    const { artifact } = await captureArtifact(
      () => {
        setPadding(6);
        setWidth(40);
      },
      { scenario: 'box-style-props' },
    );

    expect(box).toHaveClass(spacingClass({ p: 6 }), resolveStyleClass({ w: 40 }, 'size')!.className);
    expect(box).not.toHaveClass(spacingClass({ p: 2 }));
    expect(box).toHaveClass(resolveStyleClass({ display: 'block' }, 'display')!.className);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /Box/ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Box p={4}>Padded</Box>
        <Box role="region" aria-label="Sidebar" w="50%" display={{ base: 'none', sm: 'block' }}>
          Sidebar
        </Box>
      </SlopkitUi>
    ));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./box.fixtures.tsx', 'styleProps');
  });
});
