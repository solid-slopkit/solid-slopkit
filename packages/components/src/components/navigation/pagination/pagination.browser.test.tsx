import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Pagination } from './pagination';

describe('<Pagination /> in a browser', () => {
  test('Tab goes through the enabled items; Enter on a page selects it and keeps focus there', async () => {
    const { getByRole } = render(() => <Pagination total={10} />);

    await userEvent.tab();
    // Previous is disabled on the first page, so the first stop is page 1.
    expect(getByRole('button', { name: 'Page 1' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(getByRole('button', { name: 'Page 5' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
    expect(getByRole('button', { name: 'Page 5' })).toHaveFocus();
  });

  test('the items are squares as tall as a Button; the current page is filled', () => {
    const { getByRole } = render(() => <Pagination total={5} defaultValue={2} />);
    const current = getByRole('button', { name: 'Page 2' });
    const other = getByRole('button', { name: 'Page 3' });
    const rect = other.getBoundingClientRect();

    expect(Math.round(rect.width)).toBe(Math.round(rect.height));
    expect(getComputedStyle(current).backgroundColor).not.toBe(getComputedStyle(other).backgroundColor);
  });

  test('a narrow container wraps the row', () => {
    const { getByRole } = render(() => (
      <div style={{ width: '160px' }}>
        <Pagination total={20} defaultValue={10} withEdges />
      </div>
    ));
    const first = getByRole('button', { name: 'First page' }).getBoundingClientRect();
    const last = getByRole('button', { name: 'Last page' }).getBoundingClientRect();

    expect(last.top).toBeGreaterThan(first.top);
  });
});
