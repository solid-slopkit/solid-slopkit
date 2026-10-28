import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass, resolveStyleProps } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { AspectRatio } from './aspect-ratio';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const ratioClass = (ratio: number) => resolveStyleClass({ ratio }, 'aspectRatio')!.className;

describe('<AspectRatio />', () => {
  test('defaults to a square, and takes any ratio', () => {
    expect(resolveStyleProps({}, 'aspectRatio')).toEqual({ base: ['--_aspect-ratio:1'] });
    expect(resolveStyleProps({ ratio: 16 / 9 }, 'aspectRatio')).toEqual({ base: [`--_aspect-ratio:${16 / 9}`] });
  });

  test('renders a div with the ratio class and passes other props through', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <AspectRatio data-testid="ar" ratio={4 / 3} class="mine" id="a">
          <img alt="" />
        </AspectRatio>
      </SlopkitUi>
    ));
    flush();
    const wrapper = getByTestId('ar');

    expect(wrapper).toHaveClass('slp-aspect-ratio', 'mine', ratioClass(4 / 3));
    expect(wrapper).toHaveAttribute('id', 'a');
    expect(wrapper).not.toHaveAttribute('ratio');
    expect(wrapper.firstElementChild?.tagName).toBe('IMG');
  });

  test('changing the ratio swaps the class without diagnostics or waste', async () => {
    const [ratio, setRatio] = createSignal(1, { name: 'ratio' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <AspectRatio data-testid="ar" ratio={ratio()} />
      </SlopkitUi>
    ));
    flush();
    const wrapper = getByTestId('ar');

    const { artifact } = await captureArtifact(() => setRatio(21 / 9), { scenario: 'aspect-ratio-ratio' });

    expect(wrapper).toHaveClass(ratioClass(21 / 9));
    expect(wrapper).not.toHaveClass(ratioClass(1));
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /AspectRatio/ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <AspectRatio ratio={16 / 9}>
          <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="A landscape" />
        </AspectRatio>
        <AspectRatio>
          <iframe src="about:blank" title="Embedded video" />
        </AspectRatio>
      </SlopkitUi>
    ));
    flush();

    // jsdom can't host axe inside the iframe; the iframe's own title is still checked.
    const results = await axe.run(container, { iframes: false });
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./aspect-ratio.fixtures.tsx', 'ratios');
  });
});
