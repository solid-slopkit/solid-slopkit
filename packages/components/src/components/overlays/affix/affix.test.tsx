import { render } from '@solidjs/testing-library';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { Affix } from './affix';

describe('<Affix />', () => {
  test('a manual popover with the root class and its defaults, shown once mounted', () => {
    const { getByTestId } = render(() => (
      <Affix data-testid="affix">
        <button>Top</button>
      </Affix>
    ));
    const affix = getByTestId('affix');

    expect(affix.tagName).toBe('DIV');
    expect(affix).toHaveAttribute('popover', 'manual');
    expect(affix).toHaveClass('slp-affix');
    expect(affix).toHaveAttribute('data-position', 'bottom-right');
    expect(affix.style.getPropertyValue('--_affix-offset')).toBe('20px');
    expect(affix).toHaveAttribute('data-test-popover-open', '');
  });

  test('reflects its props, keeps the style and ref, and passes the rest to the div', () => {
    let ref: HTMLDivElement | undefined;
    const { getByText } = render(() => (
      <Affix
        position="top-left"
        offset={8}
        class="mine"
        style={{ color: 'red' }}
        role="region"
        aria-label="Shortcuts"
        ref={(el) => (ref = el)}
      >
        Content
      </Affix>
    ));
    const affix = getByText('Content');

    expect(affix).toHaveAttribute('role', 'region');
    expect(affix).toHaveAttribute('aria-label', 'Shortcuts');
    expect(affix).toHaveClass('slp-affix', 'mine');
    expect(affix).toHaveAttribute('data-position', 'top-left');
    expect(affix.style.getPropertyValue('--_affix-offset')).toBe('8px');
    expect(affix.style.color).toBe('red');
    expect(ref).toBe(affix);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <Affix>
        <button>Back to top</button>
      </Affix>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./affix.fixtures.tsx', 'affixes');
  });
});
