import { For } from 'solid-js';
import { Table } from '@solid-slopkit/components';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const rows = Array.from({ length: 12 }, (_, index) => ({
  region: `Region ${index + 1}`,
  values: months.map((_, month) => ((index + 3) * (month + 5) * 37) % 900),
}));

export default function Scroll() {
  return (
    <Table.ScrollContainer role="region" aria-label="Monthly sales, scrollable" style={{ 'max-height': '16rem' }}>
      <Table stickyHeader size="sm" style={{ 'min-width': '52rem' }}>
        <Table.Caption>Monthly sales, in units</Table.Caption>
        <Table.Thead>
          <Table.Tr>
            <Table.Th scope="col">Region</Table.Th>
            <For each={months}>{(month) => <Table.Th scope="col">{month}</Table.Th>}</For>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <For each={rows}>
            {(row) => (
              <Table.Tr>
                <Table.Th scope="row">{row.region}</Table.Th>
                <For each={row.values}>{(value) => <Table.Td>{value}</Table.Td>}</For>
              </Table.Tr>
            )}
          </For>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
