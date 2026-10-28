import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { Space } from './space';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

describe('<Space />', () => {
  test('renders an empty div sized by w and h', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Space data-testid="h" h={4} />
        <Space data-testid="w" w={{ base: 2, md: 8 }} class="mine" />
      </SlopkitUi>
    ));
    flush();
    const vertical = getByTestId('h');
    const horizontal = getByTestId('w');

    expect(vertical).toBeEmptyDOMElement();
    expect(vertical).toHaveClass('slp-space', resolveStyleClass({ h: 4 }, 'size')!.className);
    expect(vertical).not.toHaveAttribute('h');
    expect(horizontal).toHaveClass('slp-space', 'mine', resolveStyleClass({ w: { base: 2, md: 8 } }, 'size')!.className);
  });

  test('without w or h it has no generated class', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Space data-testid="s" />
      </SlopkitUi>
    ));
    flush();

    expect(
      getByTestId('s')
        .className.split(' ')
        .filter((name) => name.startsWith('slp-s-')),
    ).toEqual([]);
  });

  test('changing h swaps the class without diagnostics or waste', async () => {
    const [height, setHeight] = createSignal(4, { name: 'height' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Space data-testid="s" h={height()} />
      </SlopkitUi>
    ));
    flush();
    const space = getByTestId('s');

    const { artifact } = await captureArtifact(() => setHeight(10), { scenario: 'space-h' });

    expect(space).toHaveClass(resolveStyleClass({ h: 10 }, 'size')!.className);
    expect(space).not.toHaveClass(resolveStyleClass({ h: 4 }, 'size')!.className);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /Space/ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <p>Above</p>
        <Space h={8} />
        <p>Below</p>
        <Space w={{ base: 2, md: 4 }} />
      </SlopkitUi>
    ));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./space.fixtures.tsx', 'verticalAndHorizontal');
  });
});
