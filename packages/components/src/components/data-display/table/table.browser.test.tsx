import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Table } from './table';

const Rows = () => (
  <>
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ada</td>
        <td>Engineer</td>
      </tr>
      <tr>
        <td>Grace</td>
        <td>Admiral</td>
      </tr>
      <tr>
        <td>Alan</td>
        <td>Mathematician</td>
      </tr>
    </tbody>
  </>
);

describe('<Table /> in a browser', () => {
  test('full width; header cells bold and at the start; a line between rows but not under the last', () => {
    const { getByRole, getByText } = render(() => (
      <div style={{ width: '400px' }}>
        <Table>
          <Rows />
        </Table>
      </div>
    ));
    const header = getComputedStyle(getByText('Name'));

    expect(Math.round(getByRole('table').getBoundingClientRect().width)).toBe(400);
    expect([header.fontWeight, header.textAlign]).toEqual(['600', 'start']);
    expect(getComputedStyle(getByText('Ada')).borderBottomWidth).toBe('1px');
    expect(getComputedStyle(getByText('Alan')).borderBottomWidth).toBe('0px');
  });

  test('striped tints odd body rows; size sets the padding', () => {
    const { getAllByRole } = render(() => (
      <>
        <Table striped size="xs">
          <Rows />
        </Table>
        <Table size="xl">
          <Rows />
        </Table>
      </>
    ));
    const [striped, roomy] = getAllByRole('table');
    const cells = striped.querySelectorAll('tbody td:first-child');

    expect(getComputedStyle(cells[0]).backgroundColor).toMatch(/\/ 0\.04\)$/);
    expect(getComputedStyle(cells[1]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(parseFloat(getComputedStyle(cells[0]).paddingTop)).toBeLessThan(
      parseFloat(getComputedStyle(roomy.querySelector('td')!).paddingTop),
    );
  });

  test('bordered: a rounded outer border and lines between columns', () => {
    const { getByRole, getByText } = render(() => (
      <Table bordered>
        <Rows />
      </Table>
    ));
    const css = getComputedStyle(getByRole('table'));

    expect([css.borderTopWidth, css.borderTopLeftRadius]).toEqual(['1px', '8px']);
    expect(getComputedStyle(getByText('Engineer')).borderLeftWidth).toBe('1px');
    expect(getComputedStyle(getByText('Ada')).borderLeftWidth).toBe('0px');
  });

  test('sticky header: header cells stay at the top of a scrolling container', () => {
    const { getByText, getByTestId } = render(() => (
      <div data-testid="box" style={{ height: '80px', overflow: 'auto' }}>
        <Table stickyHeader>
          <Rows />
        </Table>
      </div>
    ));
    const box = getByTestId('box');
    box.scrollTop = 40;

    expect(Math.round(getByText('Name').getBoundingClientRect().top)).toBe(Math.round(box.getBoundingClientRect().top));
  });

  test('the scroll container scrolls a wide table, and the keyboard can reach and scroll it', async () => {
    const { getByTestId, getByText } = render(() => (
      <>
        <button type="button">Before</button>
        <div style={{ width: '200px' }}>
          <Table.ScrollContainer data-testid="scroll">
            <Table style={{ 'min-width': '600px' }}>
              <Rows />
            </Table>
          </Table.ScrollContainer>
        </div>
      </>
    ));
    const scroll = getByTestId('scroll');
    getByText('Before').focus();

    expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(scroll);
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => scroll.scrollLeft).toBeGreaterThan(0);
  });
});
