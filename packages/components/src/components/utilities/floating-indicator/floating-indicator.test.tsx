import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { FloatingIndicator } from './floating-indicator';

function setup() {
  const [parent, setParent] = createSignal<HTMLElement | null>(null);
  const [target, setTarget] = createSignal<HTMLElement | null>(null);
  let root: HTMLDivElement | undefined;
  const result = render(() => (
    <div ref={setParent}>
      <FloatingIndicator ref={(el) => (root = el)} data-testid="indicator" class="mine" target={target()} parent={parent()} />
      <button type="button">One</button>
      <button type="button">Two</button>
    </div>
  ));
  flush();
  const button = (name: string) => result.getByRole('button', { name });
  return { ...result, root: () => root, indicator: () => result.getByTestId('indicator'), button, setTarget };
}

describe('<FloatingIndicator />', () => {
  test('renders an aria-hidden div with its root class, hidden without a target', () => {
    const { indicator, root } = setup();

    expect(indicator().tagName).toBe('DIV');
    expect(root()).toBe(indicator());
    expect(indicator()).toHaveClass('slp-floating-indicator', 'mine');
    expect(indicator()).toHaveAttribute('aria-hidden', 'true');
    expect(indicator()).toHaveAttribute('data-hidden', '');
    expect(indicator()).not.toHaveAttribute('data-placed');
  });

  test('covers the target once there is one, and hides again without one', () => {
    const { indicator, button, setTarget } = setup();

    setTarget(button('One'));
    flush();
    expect(indicator()).not.toHaveAttribute('data-hidden');
    expect(indicator()).toHaveAttribute('data-placed', '');
    expect(indicator().style.transform).toBe('translate(0px, 0px)');
    expect(indicator().style.width).toBe('0px');

    setTarget(null);
    flush();
    expect(indicator()).toHaveAttribute('data-hidden', '');
    expect(indicator()).not.toHaveAttribute('data-placed');
  });

  test('has no axe violations', async () => {
    const { container, button, setTarget } = setup();
    setTarget(button('Two'));
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('moving between targets has no diagnostics or waste, and re-runs only the placement', async () => {
    const { button, setTarget } = setup();
    setTarget(button('One'));
    flush();

    const { artifact } = await captureArtifact(
      () => {
        setTarget(button('Two'));
        flush();
        setTarget(button('One'));
        flush();
      },
      { scenario: 'floating-indicator-move' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2, { scope: /FloatingIndicator\.place/ });
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./floating-indicator.fixtures.tsx', 'floatingIndicators');
  });
});
