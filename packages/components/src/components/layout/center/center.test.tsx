import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { Center } from './center';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const flexClass = (props: Parameters<typeof resolveStyleClass>[0]) => resolveStyleClass(props, 'flex')!.className;

describe('<Center />', () => {
  test('is a flex that centers both ways, and passes other props to the div', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Center data-testid="c" class="mine" id="c" />
      </SlopkitUi>
    ));
    flush();
    const center = getByTestId('c');

    expect(center).toHaveClass('slp-flex', 'slp-center', 'mine');
    expect(center).toHaveClass(flexClass({ display: 'flex', align: 'center', justify: 'center' }));
    expect(center).toHaveAttribute('id', 'c');
  });

  test('inline switches to inline-flex without diagnostics or waste', async () => {
    const [inline, setInline] = createSignal(false, { name: 'inline' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Center data-testid="c" inline={inline()} />
      </SlopkitUi>
    ));
    flush();
    const center = getByTestId('c');

    const { artifact } = await captureArtifact(() => setInline(true), { scenario: 'center-inline' });

    expect(center).toHaveClass(flexClass({ display: 'inline-flex', align: 'center', justify: 'center' }));
    expect(center).not.toHaveAttribute('inline');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /Flex/ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Center>
          <p>Centered</p>
        </Center>
        <p>
          Text with an{' '}
          <Center inline role="img" aria-label="Star">
            *
          </Center>{' '}
          inside.
        </p>
      </SlopkitUi>
    ));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./center.fixtures.tsx', 'blockAndInline');
  });
});
