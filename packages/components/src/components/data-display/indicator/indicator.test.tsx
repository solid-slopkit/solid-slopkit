import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Indicator } from './indicator';

const mark = (root: Element) => root.querySelector('[data-slot="indicator-mark"]');

describe('<Indicator />', () => {
  test('a span around the child, with a hidden dot at the top end in primary', () => {
    const { getByRole } = render(() => (
      <Indicator>
        <button type="button">Inbox</button>
      </Indicator>
    ));
    const root = getByRole('button').parentElement!;
    const dot = mark(root)!;

    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveClass('slp-indicator');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).toHaveAttribute('data-position', 'top-end');
    expect(dot).toHaveAttribute('data-color', 'primary');
    expect(dot).toHaveAttribute('data-size', 'md');
    expect(dot).not.toHaveAttribute('data-with-label');
    expect(dot).toBeEmptyDOMElement();
  });

  test('label, position, color, size and processing go on the mark; offset on the root style; other props pass through', () => {
    const { container } = render(() => (
      <Indicator
        label="12"
        position="bottom-start"
        color="error"
        size="lg"
        offset={4}
        processing
        style={{ margin: '1px' }}
        id="i"
        class="mine"
      >
        <span>Messages</span>
      </Indicator>
    ));
    const root = container.firstElementChild as HTMLElement;
    const pill = mark(root)!;

    expect(pill).toHaveTextContent('12');
    expect(pill).toHaveAttribute('data-with-label', '');
    expect(pill).toHaveAttribute('data-position', 'bottom-start');
    expect(pill).toHaveAttribute('data-color', 'error');
    expect(pill).toHaveAttribute('data-size', 'lg');
    expect(pill).toHaveAttribute('data-processing', '');
    expect(root.style.getPropertyValue('--_indicator-offset')).toBe('4px');
    expect(root.style.margin).toBe('1px');
    expect(root).toHaveAttribute('id', 'i');
    expect(root).toHaveClass('slp-indicator', 'mine');
    expect(root).not.toHaveAttribute('label');
  });

  test('disabled hides the mark', () => {
    const [disabled, setDisabled] = createSignal(false, { name: 'disabled' });
    const { container } = render(() => (
      <Indicator disabled={disabled()}>
        <span>Child</span>
      </Indicator>
    ));

    expect(mark(container)).not.toBeNull();
    setDisabled(true);
    flush();
    expect(mark(container)).toBeNull();
    expect(container).toHaveTextContent('Child');
  });

  test('the label element is created once', () => {
    let created = 0;
    const Label = () => {
      created++;
      return <b>3</b>;
    };
    render(() => (
      <Indicator label={<Label />}>
        <span>Child</span>
      </Indicator>
    ));

    expect(created).toBe(1);
  });

  test('changing the count updates the label without diagnostics or waste', async () => {
    const [count, setCount] = createSignal(3, { name: 'count' });
    const { container } = render(() => (
      <Indicator label={count()}>
        <span>Child</span>
      </Indicator>
    ));
    flush();

    const { artifact } = await captureArtifact(() => setCount(4), { scenario: 'indicator-count' });

    expect(mark(container)).toHaveTextContent('4');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Indicator label="3" color="error">
          <button type="button" aria-label="Inbox, 3 unread">
            Inbox
          </button>
        </Indicator>
        <Indicator processing position="bottom-end">
          <span>Deploying</span>
        </Indicator>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./indicator.fixtures.tsx', 'indicators');
  });
});
