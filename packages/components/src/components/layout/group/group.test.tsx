import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { captureArtifact } from '@solidjs/diagnostics';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { resolveStyleClass } from '../../../style-props';
import { expectHydration } from '../../../../test/ssr';
import { Group } from './group';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const flexClass = (props: Parameters<typeof resolveStyleClass>[0]) => resolveStyleClass(props, 'flex')!.className;

describe('<Group />', () => {
  test('is a wrapping row flex with its default gap and alignment', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Group data-testid="group" />
      </SlopkitUi>
    ));
    flush();
    const group = getByTestId('group');

    expect(group).toHaveClass('slp-flex', 'slp-group');
    expect(group).toHaveClass(flexClass({ gap: 4, align: 'center', justify: 'flex-start', wrap: 'wrap' }));
    expect(group).not.toHaveAttribute('data-grow');
    expect(group).toHaveAttribute('data-prevent-grow-overflow', '');
  });

  test('passes its props to Flex, and the rest to the div', () => {
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Group data-testid="group" gap={1} align="start" justify="end" wrap="nowrap" class="mine" id="g" />
      </SlopkitUi>
    ));
    flush();
    const group = getByTestId('group');

    expect(group).toHaveClass('mine');
    expect(group).toHaveAttribute('id', 'g');
    expect(group).toHaveClass(flexClass({ gap: 1, align: 'start', justify: 'end', wrap: 'nowrap' }));
  });

  test('grow and preventGrowOverflow are data attributes and update without diagnostics or waste', async () => {
    const [grow, setGrow] = createSignal(false, { name: 'grow' });
    const [prevent, setPrevent] = createSignal(true, { name: 'preventGrowOverflow' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Group data-testid="group" grow={grow()} preventGrowOverflow={prevent()} />
      </SlopkitUi>
    ));
    flush();
    const group = getByTestId('group');

    const { artifact } = await captureArtifact(
      () => {
        setGrow(true);
        setPrevent(false);
      },
      { scenario: 'group-grow' },
    );

    expect(group).toHaveAttribute('data-grow', '');
    expect(group).not.toHaveAttribute('data-prevent-grow-overflow');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('changing gap swaps the class without diagnostics or waste', async () => {
    const [gap, setGap] = createSignal(4, { name: 'gap' });
    const { getByTestId } = render(() => (
      <SlopkitUi>
        <Group data-testid="group" gap={gap()} />
      </SlopkitUi>
    ));
    flush();
    const group = getByTestId('group');

    const { artifact } = await captureArtifact(() => setGap(8), { scenario: 'group-gap' });

    expect(group).toHaveClass(flexClass({ gap: 8, align: 'center', justify: 'flex-start', wrap: 'wrap' }));
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(1, { scope: /Flex/ });
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Group>
          <button type="button">Cancel</button>
          <button type="button">Save</button>
        </Group>
        <Group role="toolbar" aria-label="Formatting" grow preventGrowOverflow={false}>
          <button type="button">Bold</button>
        </Group>
      </SlopkitUi>
    ));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./group.fixtures.tsx', 'defaultsAndGrow');
  });
});
