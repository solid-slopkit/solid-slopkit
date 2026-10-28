import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { claimLinksAsCurrent } from '../../../../test/link-claims';
import { Pagination, type PaginationProps } from './pagination';
import { paginationRange } from './pagination-range';

const show = (items: ReturnType<typeof paginationRange>) =>
  items.map((item) => (typeof item === 'number' ? item : '…')).join(' ');

describe('paginationRange', () => {
  test('every page while they fit', () => {
    expect(show(paginationRange(7, 4, 1, 1))).toBe('1 2 3 4 5 6 7');
    expect(show(paginationRange(0, 1, 1, 1))).toBe('');
  });

  test('a gap on one or both sides, always the same count', () => {
    expect(show(paginationRange(10, 1, 1, 1))).toBe('1 2 3 4 5 … 10');
    expect(show(paginationRange(10, 4, 1, 1))).toBe('1 2 3 4 5 … 10');
    expect(show(paginationRange(10, 5, 1, 1))).toBe('1 … 4 5 6 … 10');
    expect(show(paginationRange(10, 7, 1, 1))).toBe('1 … 6 7 8 9 10');
    expect(show(paginationRange(10, 10, 1, 1))).toBe('1 … 6 7 8 9 10');
    for (let page = 1; page <= 20; page++) expect(paginationRange(20, page, 1, 1)).toHaveLength(7);
  });

  test('siblings and boundaries', () => {
    expect(show(paginationRange(20, 10, 2, 1))).toBe('1 … 8 9 10 11 12 … 20');
    expect(show(paginationRange(20, 10, 1, 2))).toBe('1 2 … 9 10 11 … 19 20');
    expect(show(paginationRange(20, 10, 1, 0))).toBe('… 9 10 11 …');
    expect(show(paginationRange(20, 1, 1, 0))).toBe('1 2 3 4 …');
    expect(show(paginationRange(20, 20, 1, 0))).toBe('… 17 18 19 20');
  });
});

function setup(props: Partial<PaginationProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => <Pagination total={10} onChange={onChange} {...props} />);
  flush();
  const pages = () =>
    [...result.container.querySelectorAll('[data-slot="pagination-page"], [data-slot="pagination-dots"]')].map(
      (item) => item.textContent,
    );
  const page = (number: number) => result.getByRole(props.getPageHref ? 'link' : 'button', { name: `Page ${number}` });
  const click = (element: Element) => {
    fireEvent.click(element);
    flush();
  };
  return { ...result, pages, page, click, onChange };
}

describe('<Pagination />', () => {
  test('a nav of page buttons with the current one marked, between previous and next', () => {
    const { getByRole, pages, page, container } = setup({ class: 'mine' });

    expect(getByRole('navigation', { name: 'Pagination' })).toHaveClass('slp-pagination', 'mine');
    expect(pages()).toEqual(['1', '2', '3', '4', '5', '…', '10']);
    expect(page(1)).toHaveAttribute('aria-current', 'page');
    expect(page(1)).toHaveAttribute('data-current', '');
    expect(page(2)).not.toHaveAttribute('aria-current');
    expect(page(2)).not.toHaveAttribute('data-current');
    expect(getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(getByRole('button', { name: 'Next page' })).toBeEnabled();
    expect(container.querySelector('[data-slot="pagination-dots"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('a click on a page, previous or next changes the page', () => {
    const { getByRole, page, pages, click, onChange } = setup();

    click(page(5));
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(pages()).toEqual(['1', '…', '4', '5', '6', '…', '10']);
    expect(page(5)).toHaveAttribute('aria-current', 'page');
    click(getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenLastCalledWith(6);
    click(getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  test('the page button that was pressed is the same element afterwards, so focus stays on it', () => {
    const { page, click } = setup();
    const five = page(5);
    five.focus();

    click(five);
    expect(page(5)).toBe(five);
    expect(five).toHaveFocus();
  });

  test('the current page again calls nothing', () => {
    const { page, click, onChange } = setup({ defaultValue: 3 });
    click(page(3));
    expect(onChange).not.toHaveBeenCalled();
  });

  test('withEdges adds first and last, disabled on their own page', () => {
    const { getByRole, click, onChange } = setup({ withEdges: true });

    expect(getByRole('button', { name: 'First page' })).toBeDisabled();
    click(getByRole('button', { name: 'Last page' }));
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(getByRole('button', { name: 'Last page' })).toBeDisabled();
    expect(getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  test('withControls={false} leaves the pages', () => {
    const { queryByRole } = setup({ withControls: false });
    expect(queryByRole('button', { name: 'Previous page' })).toBeNull();
  });

  test('getPageHref makes them links; the ones that go nowhere have no href', () => {
    const onChange = vi.fn();
    const { page, getByRole, click } = setup({ getPageHref: (number) => `?page=${number}`, defaultValue: 1, onChange });

    expect(page(3)).toHaveAttribute('href', '?page=3');
    const previous = getByRole('link', { name: 'Previous page' });
    expect(previous).not.toHaveAttribute('href');
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(getByRole('link', { name: 'Next page' })).toHaveAttribute('href', '?page=2');

    click(page(3));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  test('links keep their own current state when a router marks every link to this page', () => {
    claimLinksAsCurrent();
    const { page, getByRole, click } = setup({ getPageHref: (number) => `#page-${number}`, defaultValue: 2 });
    const current = () =>
      getByRole('navigation')
        .querySelectorAll('[data-current]')
        .values()
        .map((item) => item.getAttribute('aria-label'))
        .toArray();

    expect(current()).toEqual(['Page 2']);
    expect(page(2)).toHaveAttribute('aria-current', 'page');
    expect(page(3)).toHaveAttribute('aria-current', 'false');
    expect(getByRole('link', { name: 'Next page' })).toHaveAttribute('aria-current', 'false');

    click(page(3));
    expect(current()).toEqual(['Page 3']);
    expect(page(2)).toHaveAttribute('aria-current', 'false');
    expect(page(3)).toHaveAttribute('aria-current', 'page');
  });

  test('controlled: shows value, and only asks to change it; out of range values are clamped', () => {
    const [value, setValue] = createSignal(2);
    const onChange = vi.fn();
    const { getByRole } = render(() => <Pagination total={5} value={value()} onChange={onChange} />);
    flush();

    fireEvent.click(getByRole('button', { name: 'Page 4' }));
    flush();
    expect(onChange).toHaveBeenCalledWith(4);
    expect(getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');

    setValue(99);
    flush();
    expect(getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
  });

  test('disabled: nothing can be pressed', () => {
    const { page, getByRole, click, onChange } = setup({ disabled: true });

    expect(page(2)).toBeDisabled();
    expect(getByRole('button', { name: 'Next page' })).toBeDisabled();
    click(page(2));
    expect(onChange).not.toHaveBeenCalled();
  });

  test('hideWithOnePage hides it with one page', () => {
    const { queryByRole } = setup({ total: 1, hideWithOnePage: true });
    expect(queryByRole('navigation')).toBeNull();
  });

  test('labels can be changed', () => {
    const { getByRole } = setup({
      'aria-label': 'Results pages',
      previousLabel: 'Zurück',
      nextLabel: 'Weiter',
      pageLabel: (number) => `Seite ${number}`,
    });

    expect(getByRole('navigation', { name: 'Results pages' })).toBeDefined();
    expect(getByRole('button', { name: 'Zurück' })).toBeDefined();
    expect(getByRole('button', { name: 'Seite 3' })).toBeDefined();
  });

  test('has no axe violations, buttons and links', async () => {
    const { container } = setup({ withEdges: true, defaultValue: 5 });
    expect((await axe.run(container)).violations).toEqual([]);
    const links = setup({ getPageHref: (number) => `?page=${number}` });
    expect((await axe.run(links.container)).violations).toEqual([]);
  });

  test('moving between pages has no diagnostics', async () => {
    const { page, getByRole, click } = setup();

    const { artifact } = await captureArtifact(
      () => {
        click(page(5));
        click(getByRole('button', { name: 'Next page' }));
        click(page(10));
      },
      { scenario: 'pagination-move' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./pagination.fixtures.tsx', 'paginations');
  });
});
