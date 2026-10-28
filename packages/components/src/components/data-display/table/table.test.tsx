import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Table } from './table';

const People = (props: { rows: { name: string; role: string }[] }) => (
  <Table>
    <Table.Caption>Team</Table.Caption>
    <Table.Thead>
      <Table.Tr>
        <Table.Th scope="col">Name</Table.Th>
        <Table.Th scope="col">Role</Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      <For each={props.rows}>
        {(row) => (
          <Table.Tr>
            <Table.Th scope="row">{row.name}</Table.Th>
            <Table.Td>{row.role}</Table.Td>
          </Table.Tr>
        )}
      </For>
    </Table.Tbody>
    <Table.Tfoot>
      <Table.Tr>
        <Table.Th scope="row">Total</Table.Th>
        <Table.Td>{props.rows.length}</Table.Td>
      </Table.Tr>
    </Table.Tfoot>
  </Table>
);

describe('<Table />', () => {
  test('the parts render the native table elements, each with its root class', () => {
    const { getByRole, getAllByRole } = render(() => <People rows={[{ name: 'Ada', role: 'Engineer' }]} />);
    const table = getByRole('table', { name: 'Team' });

    expect(table.tagName).toBe('TABLE');
    expect(table).toHaveClass('slp-table');
    expect(table).toHaveAttribute('data-size', 'md');
    expect(table.querySelector('caption')).toHaveClass('slp-table-caption');
    expect(table.querySelector('thead')).toHaveClass('slp-table-thead');
    expect(table.querySelector('tbody')).toHaveClass('slp-table-tbody');
    expect(table.querySelector('tfoot')).toHaveClass('slp-table-tfoot');
    expect(getAllByRole('row')[0]).toHaveClass('slp-table-tr');
    expect(getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['Name', 'Role']);
    expect(getAllByRole('rowheader').map((th) => th.textContent)).toEqual(['Ada', 'Total']);
    expect(getAllByRole('cell')[0]).toHaveClass('slp-table-td');
  });

  test('options are data attributes; other props pass through', () => {
    const { getByRole } = render(() => (
      <Table striped hover bordered stickyHeader size="lg" id="t" class="mine">
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      </Table>
    ));
    const table = getByRole('table');

    for (const name of ['striped', 'hover', 'bordered', 'sticky-header']) expect(table).toHaveAttribute(`data-${name}`, '');
    expect(table).toHaveAttribute('data-size', 'lg');
    expect(table).toHaveAttribute('id', 't');
    expect(table).toHaveClass('slp-table', 'mine');
    expect(table).not.toHaveAttribute('striped');
  });

  test('the scroll container is a focusable div; tabindex can be overridden', () => {
    const { getByTestId } = render(() => (
      <>
        <Table.ScrollContainer data-testid="scroll" />
        <Table.ScrollContainer data-testid="still" tabindex={-1} />
      </>
    ));

    expect(getByTestId('scroll')).toHaveClass('slp-table-scroll-container');
    expect(getByTestId('scroll')).toHaveAttribute('tabindex', '0');
    expect(getByTestId('still')).toHaveAttribute('tabindex', '-1');
  });

  test('adding a row renders only that row, without diagnostics', async () => {
    const [rows, setRows] = createSignal([{ name: 'Ada', role: 'Engineer' }], { name: 'rows' });
    const { getAllByRole } = render(() => <People rows={rows()} />);
    flush();

    const { artifact } = await captureArtifact(() => setRows((list) => [...list, { name: 'Grace', role: 'Admiral' }]), {
      scenario: 'table-add-row',
    });

    expect(getAllByRole('rowheader').map((th) => th.textContent)).toEqual(['Ada', 'Grace', 'Total']);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(4);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <Table.ScrollContainer aria-label="Team, scrollable" role="region">
        <People rows={[{ name: 'Ada', role: 'Engineer' }]} />
      </Table.ScrollContainer>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./table.fixtures.tsx', 'tables');
  });
});
